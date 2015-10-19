/**
 * Load configuration file given as command line parameter
 */
if (process.argv.length > 2) {
  console.log('loading configuration file: ' + process.argv[2]);
  var config = require(process.argv[2]);
  if (process.argv.length > 3){
    config.backend = process.argv[3];
  }

}else{
  console.error('no configuration file provided');
  process.exit();
};

/**
 * Module dependencies.
 */

// external
var koa = require('koa');
var logger = require('koa-logger');
var route = require('koa-route');
var nunjucks = require('koa-nunjucks-2');
var path = require('path');
var request = require('superagent');
var thunkify = require('thunkify');
var get = thunkify(request.get);
var markdownParser = new require('markdown-it')();
var sendfile = require('koa-sendfile');

// internal
var madoko = require('./js/madoko.js');

/**
 * Setup Koa
 */

var app = module.exports = koa();

// middleware

if (config.debug){
  app.use(logger());
}
if (!config.externalStatic){
  app.use(require('koa-static-folder')('./static'));
}

app.context.render = nunjucks({
  autoescape: true,
  ext: 'nunjucks',
  path: path.join(__dirname, 'views'),
  noCache: config.debug,
  watch: config.debug,
  dev: config.debug
});

// backend link

var backendApi, backendInfo;
if (config.backend === true){
  // True value means to use docker provided environment variable
  backendApi = 'http://' + process.env.BACKEND_PORT_8081_TCP_ADDR + ':8081';
}else if (config.backend){
  // Backend API address can also be given with a string directly
  backendApi = config.backend;
}

/**
 * Routing
 */

// route middleware

app.use(route.get('/', index));
app.use(route.get('/download', download));
app.use(route.get('/manifesto', manifesto));
app.use(route.get('/terms', terms));
app.use(route.get('/privacy', privacy));
app.use(route.get('/our/:handle', ourOwner));
app.use(route.get('/our/:handle/:path', ourOwnerPath));
app.use(route.get('/our/:handle/:path/pdf', ourOwnerPathPdf));

// routes

function *index() {
  console.log('GET /');
  this.body = yield this.render('pages/home');
}
function *download() {
  console.log('GET /download');
  this.body = yield this.render('pages/download');
}
function *manifesto() {
  console.log('GET /manifesto');
  this.body = yield this.render('pages/manifesto');
}
function *terms() {
  console.log('GET /terms');
  this.body = yield this.render('pages/terms');
}
function *privacy() {
  console.log('GET /privacy');
  this.body = yield this.render('pages/privacy');
}

function *ourOwner(handle) {
  console.log('GET /our/' + handle);
  var context = {};
  if (backendApi){
    var backendResponse = yield get(backendApi + '/public/' + handle);
    if (backendResponse.status === 200){
      var ownerData = backendResponse.body;
      context.ownerTitle = ownerData.owner;
      context.ownerContent = ownerData.content ? markdownParser.render(ownerData.content) : '';
    }
  }
  this.body = yield this.render('pages/owner', context);
}

function *ourOwnerPath(handle, path) {
  console.log('GET /our/' + handle + '/' + path);

  var context = {};
  if (backendApi){
    var backendResponse = yield get(backendApi + '/public/' + handle + '/' + path);
    if (backendResponse.status === 200){
      var ownerPathData = backendResponse.body;
      if (ownerPathData.note && ownerPathData.note.format === 'madoko' && ownerPathData.note.content &&
          ownerPathData.note.content.length){
        var bibPath = madoko.getMadokoBibliographyPath(ownerPathData);
        var bibPathData;
        if (bibPath){
          var bibResponse = yield get(backendApi + '/public/' + bibPath);
          if (bibResponse.status === 200) bibPathData = bibResponse.body;
        }
        //var madokoHtml = yield madoko.getMadokoHtml(handle, path, ownerPathData, bibPathData, bibPath);
        this.body = yield madoko.getMadokoHtml(handle, path, ownerPathData, bibPathData, bibPath);
      }else{
        // TODO: Format non-Madoko page with markdown-it normally
      }
    }
  }
}

function *ourOwnerPathPdf(handle, path) {
  console.log('GET /our/' + handle + '/' + path + '/pdf');
  if (backendApi){
    var backendResponse = yield get(backendApi + '/public/' + handle + '/' + path);
    if (backendResponse.status === 200){
      var ownerPathData = backendResponse.body;
      if (ownerPathData.note && ownerPathData.note.format === 'madoko' && ownerPathData.note.content &&
          ownerPathData.note.content.length){
        var bibPath = madoko.getMadokoBibliographyPath(ownerPathData);
        var bibPathData;
        if (bibPath){
          var bibResponse = yield get(backendApi + '/public/' + bibPath);
          if (bibResponse.status === 200) bibPathData = bibResponse.body;
        }
        var madokoHtml = yield madoko.getMadokoHtml(handle, path, ownerPathData, bibPathData, bibPath);
        if (madokoHtml) yield* sendfile.call(this, madoko.getMadokoPDFPath(handle, path));
      }
    }
  }
}

// get backend /info path from backend on boot

if (backendApi){
  var requestInProgress;
  var backendPollInterval = setInterval(function(){
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
