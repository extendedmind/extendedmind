import {Server, Config} from  "./server";

/**
 * Load configuration file given as command line parameter
 */
let config: Config;
if (process.argv.length > 2) {
  console.info("loading configuration file: " + process.argv[2]);
  config = require(process.argv[2]);
  if (process.argv.length > 3) {
    config.backend = process.argv[3];
  }
  if (process.argv.length > 4){
    config.generatedFilesPath = process.argv[4];
  }
  if (process.env.EXTENDEDMIND_URL_ORIGIN){
    console.info("setting url origin to: " + process.env.EXTENDEDMIND_URL_ORIGIN);
    config.urlOrigin = process.env.EXTENDEDMIND_URL_ORIGIN;
  }
}else {
  console.error("no configuration file provided, exiting...");
  process.exit();
};
const server = new Server(config);
server.run();
