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

var views = require('co-views');
var koa = require('koa');
var logger = require('koa-logger');
var route = require('koa-route');

// main

var app = module.exports = koa();
var render = views(__dirname + '/views', { ext: 'nunjucks' });

// middleware

app.use(logger());
if (!config.externalStatic){
  app.use(require('koa-static-folder')('./static'));
}

// route middleware

app.use(route.get('/', index));
app.use(route.get('/download', download));
app.use(route.get('/manifesto', manifesto));
app.use(route.get('/terms', terms));
app.use(route.get('/privacy', privacy));

// routes

function *index() {
  console.log('got index')
  this.body = yield render('pages/home');
}
function *download() {
  this.body = yield render('pages/download');
}
function *manifesto() {
  console.log('got manifesto')
  this.body = yield render('pages/manifesto');
}
function *terms() {
  this.body = yield render('pages/terms');
}
function *privacy() {
  this.body = yield render('pages/privacy');
}

// listen

app.listen(config.port);
console.log('listening on port ' + config.port);
