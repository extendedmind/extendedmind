import * as Koa from "koa";
import * as logger from "koa-logger";
import * as serve from "koa-static";
import * as Router from "koa-router";
import * as path from "path";
import { Render } from "./rendering";
import { Utils, Info } from "extendedmind-siteutils";
import { Routing } from "./routing";
import { Visualization } from "./visualization";

export interface Config {
  version: string;
  port: number;
  externalStatic: boolean;
  debug: boolean;
  backend: any; // Can be true, false or a string
  urlOrigin: string;
  ownersPath?: string;
  headersPath?: string;
  extraRoutingModule?: string;
  syncTimeTreshold?: number;
  generatedFilesPath?: string;
}

export class Server {

  private version: string;
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
  // Save generated images to public path by default
  private generatedFilesPath: string = path.join(__dirname, "../public/generated");
  private extraRoutingModule: string;

  constructor(config: Config) {
    this.version = config.version;
    this.port = config.port;
    this.debug = config.debug;
    this.externalStatic = config.externalStatic;
    this.urlOrigin = config.urlOrigin;
    if (config.ownersPath) this.ownersPath = config.ownersPath;
    if (config.headersPath) this.headersPath = config.headersPath;
    if (config.generatedFilesPath) this.generatedFilesPath = config.generatedFilesPath;
    if (config.extraRoutingModule) this.extraRoutingModule = config.extraRoutingModule;

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
        console.info("GET " + this.backendApiAddress + "/v2/info");
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
                              viewsPath, this.version, this.debug, powered, this.urlOrigin,
                              this.ownersPath, this.headersPath);

    const visualization = new Visualization(this.generatedFilesPath);

    // setup routing

    const routing = new Routing(this.utils, backendInfo, this.headersPath, this.ownersPath, this.extraRoutingModule);

    // setup context for all routes

    this.app.use((ctx, next) => {
      ctx.state.backendClient = this.utils;
      ctx.state.render = render;
      ctx.state.visualization = visualization;
      ctx.state.urlOrigin = this.urlOrigin;
      ctx.state.ownersPath = this.ownersPath;
      routing.getHelperMethods().forEach(helperInfo => {
        ctx.state[helperInfo[0]] = helperInfo[1];
      });
      return next();
    });

    // add routes
    this.app.use(routing.getRoutes());

    // start listening
    this.app.listen(this.port);
    console.info("listening on port " + this.port);
  }
}

