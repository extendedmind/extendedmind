import * as Koa from "koa";
import * as logger from "koa-logger";
import * as serve from "koa-static";
import * as path from "path";
import {Render} from "./rendering";
import {initializeExtendedMindUtils, ExtendedMindUtilsAPI,
        ExtendedMindInfo} from "extendedmind-siteutils";
import {Routing} from "./routing";
import * as chalk from "chalk";

export interface ServerConfig {
  port: number;
  externalStatic: boolean;
  debug: boolean;
  backend: any; // Can be true, false or a string
  urlOrigin: string;
}

export function runServer(config: ServerConfig) {
  /**
   * setup Koa
   */
  const app = new Koa();

  // debugging setup

  if (config.debug) {
    app.use(logger());
  }
  if (!config.externalStatic) {
    app.use(serve("./public"));
  }

  // backend link

  let backendApiAddress: string;
  if (config.backend === true) {
    // True value means to use docker provided environment variable
    backendApiAddress = "http://" + process.env.BACKEND_PORT_8081_TCP_ADDR + ":8081";
  }else if (config.backend) {
    // Backend API address can also be given with a string directly
    backendApiAddress = config.backend;
  }else {
    throw new Error("FATAL: config.backend must be set to either true or specific address");
  }

  const backendClient = initializeExtendedMindUtils(backendApiAddress);

  // get backend /info path from backend on boot

  let requestInProgress;
  let backendPollInterval = setInterval(() => {
    if (!requestInProgress) {
      requestInProgress = true;
      console.info("GET " + backendApiAddress + "/info");
      backendClient.getInfo().then(function(backendInfo){
          requestInProgress = false;
          clearInterval(backendPollInterval);
          startListening(app, backendClient, backendInfo, config);
        },
        function(error){
          requestInProgress = false;
          console.info("backend returned status code: " + (error ? error.code : "unknown") + ", retrying...");
        });
    }
  }, 2000);
}

function startListening(app: Koa, backendClient: ExtendedMindUtilsAPI,
                        backendInfo: ExtendedMindInfo, config: ServerConfig){
  console.info("backend info:");
  console.info(JSON.stringify(backendInfo, null, 2));

  // setup rendering
  const viewsPath = path.join(__dirname, "../views");
  console.log(viewsPath)
  const render = new Render("nunjucks", backendInfo.commonCollective[1],
                            viewsPath, config.debug, config.urlOrigin);

  app.use((ctx, next) => {
    ctx.state.render = render;
    next();
  });

  // setup routing
  const routing = new Routing(backendClient, backendInfo);
  app.use(routing.getRoutes());

  // start listening
  app.listen(config.port);
  console.info(chalk.green("listening on port " + config.port));
}