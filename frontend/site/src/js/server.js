'use strict'

/**
 * Module dependencies.
 */

// external
const Koa = require('koa');
const convert = require('koa-convert');
const logger = require('koa-logger');
const request = require('superagent');

module.exports = function(config) {

  /**
   * setup Koa
   */
  const app = new Koa();

  // debugging setup

  if (config.debug){
    app.use(convert(logger()));
  }
  if (!config.externalStatic){
    app.use(convert(require('koa-static-folder')('./static')));
  }

  // backend link

  let backendApi, backendInfo;
  if (config.backend === true){
    // True value means to use docker provided environment variable
    backendApi = 'http://' + process.env.BACKEND_PORT_8081_TCP_ADDR + ':8081';
  }else if (config.backend){
    // Backend API address can also be given with a string directly
    backendApi = config.backend;
  }

  // add routing

  require('./routing.js')(config, app, convert, request, backendApi);

  // get backend /info path from backend on boot

  if (backendApi){
    let requestInProgress;
    let backendPollInterval = setInterval(function(){
      if (!requestInProgress){
        requestInProgress = true;
        console.log('GET ' + backendApi + '/info')
        request
          .get(backendApi + '/info')
          .set('Accept', 'application/json')
          .end(function(error, response){
            requestInProgress = false;
            if (response && response.ok){
              backendInfo = response.body;
              console.log('backend info:');
              console.log(JSON.stringify(backendInfo, null, 2));
              clearInterval(backendPollInterval);
            }else{
              console.log('backend returned status code: ' + (error ? error.code : 'unknown') + ', retrying...');
            }
          });
      }
    }, 2000);
  }

  // listen
  app.listen(config.port);
  console.log('listening on port ' + config.port);

}


