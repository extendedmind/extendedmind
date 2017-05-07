import {Config, Server} from "./server";

/**
 * Load configuration file given as command line parameter
 */
let config: Config;
if (process.argv.length > 2) {
  console.info("loading configuration file: " + process.argv[2]);
  config = require(process.argv[2]);
  if (process.argv.length > 3) {
    config.backend = process.argv[3];
  } else if (process.env.EXTENDEDMIND_API_URL) {
    console.info("setting backend to: " + process.env.EXTENDEDMIND_API_URL);
    config.backend = process.env.EXTENDEDMIND_API_URL;
  }
  if (process.env.EXTENDEDMIND_URL) {
    console.info("setting urlOrigin to: " + process.env.EXTENDEDMIND_URL);
    config.urlOrigin = process.env.EXTENDEDMIND_URL;
  }
} else {
  console.error("no configuration file provided, exiting...");
  process.exit();
}
const server = new Server(config);
server.run();
