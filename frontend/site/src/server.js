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
app.use(require('koa-static-folder')('./static'));

// route middleware

app.use(route.get('/', index));
app.use(route.get('/download', download));
app.use(route.get('/manifesto', manifesto));
app.use(route.get('/terms', terms));
app.use(route.get('/privacy', privacy));

// routes

function *index() {
  this.body = yield render('pages/home');
}
function *download() {
  this.body = yield render('pages/download');
}
function *manifesto() {
  this.body = yield render('pages/manifesto');
}
function *terms() {
  this.body = yield render('pages/terms');
}
function *privacy() {
  this.body = yield render('pages/privacy');
}

// listen

app.listen(3000);
console.log('listening on port 3000');
