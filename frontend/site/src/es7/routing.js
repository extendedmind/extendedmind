'use strict'

const siteutils = require('../node_modules/extendedmind-siteutils/transpile/index.js');
const route = require('koa-route');
const sendfile = siteutils.koaSendfile;
const path = require('path');
const request = require('superagent-promise')(require('superagent'), Promise);
const markdownParser = new require('markdown-it')();

module.exports = (config, app, backendApi) => {

  const backendClient = siteutils.extendedmind(backendApi);

  const nunjucks = siteutils.koaNunjucks({
    autoescape: true,
    ext: 'nunjucks',
    path: path.join(__dirname, '../views'),
    noCache: config.debug,
    watch: config.debug,
    dev: config.debug
  });
  nunjucks.env.addGlobal('development', config.debug);
  const render = nunjucks.render;
  const madoko = require('./madoko.js');

  // route middleware

  app.use(route.get('/', index));
  app.use(route.get('/download', download));
  app.use(route.get('/manifesto', manifesto));
  app.use(route.get('/blog', blog));
  app.use(route.get('/blog/:path', blogPost));
  app.use(route.get('/terms', terms));
  app.use(route.get('/privacy', privacy));
  app.use(route.get('/our/:handle', ourOwner));
  app.use(route.get('/our/:handle/:path', ourOwnerPath));
  app.use(route.get('/our/:handle/:path/pdf', ourOwnerPathPdf));

  // routes

  function index(ctx) {
    console.log('GET /');
    ctx.body = render('pages/home');
  }
  function download(ctx) {
    console.log('GET /download');
    ctx.body = render('pages/download');
  }
  function manifesto(ctx) {
    console.log('GET /manifesto');
    ctx.body = render('pages/manifesto');
  }
  async function blog(ctx) {
    console.log('GET /blog');
    let emtPublicItems = await backendClient.getPublicItems('extended-mind-technologies');
    const blogFilters = [
      {type: "keyword", include: "blog"},
      {type: "index", start: 0, max: 5}
    ];
    ctx.body = render('pages/blog', {blogPosts: emtPublicItems.getNotes(blogFilters)});
  }
  async function blogPost(ctx, path) {
    console.log('GET /blog/' + path);
    let emtPublicItems = await backendClient.getPublicItems('extended-mind-technologies');
    let publicNote = emtPublicItems.getNote(path);
    if (publicNote){
      // Make sure the note contains the blog keyword
      if (publicNote.keywords){
        for (let i=0; i<publicNote.keywords.length; i++){
          if (publicNote.keywords[i].title === 'blog'){
            ctx.body = render('pages/blogpost', {blogPost: emtPublicItems.getNote(path)});
          }
        }
      }
    }
  }
  function terms(ctx) {
    console.log('GET /terms');
    ctx.body = render('pages/terms');
  }
  function privacy(ctx) {
    console.log('GET /privacy');
    ctx.body = render('pages/privacy');
  }

  async function ourOwner(ctx, handle) {
    console.log('GET /our/' + handle);

    const publicItems = backendClient.getPublicItems(handle);

    let context = {};
    if (publicItems){
      let ownerPath = backendApi + '/public/' + handle;
      let backendResponse = await request.get(ownerPath);
      if (backendResponse.status === 200){
        let ownerData = backendResponse.body;
        context.ownerTitle = ownerData.owner;
        context.ownerContent = ownerData.content ? markdownParser.render(ownerData.content) : '';
      }
    }
    ctx.body = render('pages/owner', context);
  }

  async function ourOwnerPath(ctx, handle, path) {
    console.log('GET /our/' + handle + '/' + path);

    let context = {};
    if (backendApi){
      let backendResponse = await request.get(backendApi + '/public/' + handle + '/' + path);
      if (backendResponse.status === 200){
        let ownerPathData = backendResponse.body;
        if (ownerPathData.note && ownerPathData.note.format === 'madoko' && ownerPathData.note.content &&
            ownerPathData.note.content.length){
          let bibPath = madoko.getMadokoBibliographyPath(ownerPathData);
          let bibPathData;
          if (bibPath){
            let bibResponse = await request.get(backendApi + '/public/' + bibPath);
            if (bibResponse.status === 200) bibPathData = bibResponse.body;
          }
          ctx.body = await madoko.getMadokoHtml(handle, path, ownerPathData, bibPathData, bibPath);
        }else{
          // TODO: Format non-Madoko page with markdown-it normally
        }
      }
    }
  }

  async function ourOwnerPathPdf(ctx, handle, path) {
    console.log('GET /our/' + handle + '/' + path + '/pdf');
    if (backendApi){
      let backendResponse = await request.get(backendApi + '/public/' + handle + '/' + path);
      if (backendResponse.status === 200){
        let ownerPathData = backendResponse.body;
        if (ownerPathData.note && ownerPathData.note.format === 'madoko' && ownerPathData.note.content &&
            ownerPathData.note.content.length){
          let bibPath = madoko.getMadokoBibliographyPath(ownerPathData);
          let bibPathData;
          if (bibPath){
            let bibResponse = await request.get(backendApi + '/public/' + bibPath);
            if (bibResponse.status === 200) bibPathData = bibResponse.body;
          }
          let madokoHtml = await madoko.getMadokoHtml(handle, path, ownerPathData, bibPathData, bibPath);
          if (madokoHtml) await sendfile(ctx, madoko.getMadokoPDFPath(handle, path));
        }
      }
    }
  }
}
