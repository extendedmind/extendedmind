/**
 * Load configuration file given as command line parameter
 */
if (process.argv.length > 2) {
  console.log('loading configuration file: ' + process.argv[2]);
  var config = require(process.argv[2]);
}else{
  console.error('no configuration file provided');
  process.exit();
};

/**
 * Module dependencies.
 */

var koa = require('koa');
var logger = require('koa-logger');
var route = require('koa-route');
var nunjucks = require('koa-nunjucks-2');
var path = require('path');

// setup koa

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

// route middleware

app.use(route.get('/', index));
app.use(route.get('/download', download));
app.use(route.get('/manifesto', manifesto));
app.use(route.get('/terms', terms));
app.use(route.get('/privacy', privacy));

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

// listen

app.listen(config.port);
console.log('listening on port ' + config.port);