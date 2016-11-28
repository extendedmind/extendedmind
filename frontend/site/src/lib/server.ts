import * as Koa from "koa";
import * as logger from "koa-logger";
import * as serve from "koa-static";
import * as Router from "koa-router";
import * as path from "path";
import { Render } from "./rendering";
import { Utils, Info } from "extendedmind-siteutils";
import { Routing } from "./routing";

export interface Config {
  port: number;
  externalStatic: boolean;
  debug: boolean;
  backend: any; // Can be true, false or a string
  urlOrigin: string;
  ownersPath: string;
  headersPath: string;
  syncTimeTreshold?: number;
}

export class Server {

  private port: number;
  private debug: boolean;
  private externalStatic: boolean;
  private app: Koa;
  private router: Router;
  private utils: Utils;
  private backendApiAddress: string;
  private urlOrigin: string;
  private ownersPath: string = "our";
  // Serve headers from root by default
  private headersPath: string = "";

  constructor(config: Config) {
    this.port = config.port;
    this.debug = config.debug;
    this.externalStatic = config.externalStatic;
    this.urlOrigin = config.urlOrigin;
    if (config.ownersPath) this.ownersPath = config.ownersPath;
    if (config.headersPath) this.headersPath = config.headersPath;

    this.app = new Koa();
    this.router = new Router();

    // backend link

    if (config.backend === true) {
      // True value means to use docker provided environment variable
      this.backendApiAddress = "http://" + process.env.BACKEND_PORT_8081_TCP_ADDR + ":8081";
    }else if (config.backend) {
      // Backend API address can also be given with a string directly
      this.backendApiAddress = config.backend;
    }else {
      throw new Error("FATAL: config.backend must be set to either true or specific address");
    }
    const utilsConfig = config.syncTimeTreshold !== undefined ?
      {"syncTimeTreshold": config.syncTimeTreshold} : undefined;
    this.utils = new Utils(this.backendApiAddress, utilsConfig);
  }

  public run() {
    if (this.debug) {
      this.app.use(logger());
    }
    if (!this.externalStatic) {
      this.app.use(serve("./public"));
    }

    // get backend /info path from backend on boot

    let requestInProgress;
    let backendPollInterval = setInterval(() => {
      if (!requestInProgress) {
        requestInProgress = true;
        console.info("GET " + this.backendApiAddress + "/info");
        const thisServer = this;
        this.utils.getInfo().then(function(backendInfo){
            requestInProgress = false;
            clearInterval(backendPollInterval);
            thisServer.startListening(backendInfo);
          },
          function(error){
            requestInProgress = false;
            console.info("backend returned status code: " + (error ? error.code : "unknown") + ", retrying...");
          });
      }
    }, 2000);
  }

  private startListening(backendInfo: Info){
    console.info("backend info:");
    console.info(JSON.stringify(backendInfo, null, 2));

    // setup rendering
    const viewsPath = path.join(__dirname, "../views");

    let powered: boolean = true;
    if (backendInfo.ui) {
      const ui = JSON.parse(backendInfo.ui);
      if (ui.powered === false) powered = false;
    }
    const render = new Render("nunjucks", backendInfo.commonCollective[1],
                              viewsPath, this.debug, powered, this.urlOrigin,
                              this.ownersPath, this.headersPath);

    // setup context for all routes

    this.app.use((ctx, next) => {
      ctx.state.backendClient = this.utils;
      ctx.state.render = render;
      ctx.state.getSliceOfArrayWithRemaining = function(array, queryParamRemaining): any {
        const HEADERS_PER_PAGE: number = 10;
        // How many items were indicated as being not shown previously. If first query, everything is remaining
        const previousRemaining: number = queryParamRemaining === undefined ? array.length : queryParamRemaining;
        // Because new headers might be added to the top of the array, we use remaining to count the index from
        // the end.
        const firstHeaderIndex = array.length - previousRemaining;
        const arraySlice = array.slice(firstHeaderIndex, firstHeaderIndex + HEADERS_PER_PAGE);
        const remaining: number = array.length - (firstHeaderIndex + HEADERS_PER_PAGE) < 0
          ? 0 : array.length - (firstHeaderIndex + HEADERS_PER_PAGE);
        return {
          arraySlice: arraySlice,
          remaining: remaining,
        };
      };
      return next();
    });

    // setup routing
    const routing = new Routing(this.utils, backendInfo, this.ownersPath);
    this.app.use(routing.getRoutes());

    // start listening
    this.app.listen(this.port);
    console.info("listening on port " + this.port);
  }
}

