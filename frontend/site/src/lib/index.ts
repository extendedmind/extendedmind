import {runServer, ServerConfig} from  "./server";
import * as chalk from "chalk";

/**
 * Load configuration file given as command line parameter
 */
let config: ServerConfig;
if (process.argv.length > 2) {
  console.info("loading configuration file: " + process.argv[2]);
  config = require(process.argv[2]);
  if (process.argv.length > 3) {
    config.backend = process.argv[3];
  }
}else {
  console.error(chalk.red("no configuration file provided"));
  process.exit();
};
runServer(config);
