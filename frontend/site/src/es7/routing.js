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

  // CONFIGURE MARKDOWN

  // Open links to new tab.
  // https://github.com/markdown-it/markdown-it/blob/master/docs/architecture.md#renderer

  // Remember old renderer, if overriden, or proxy to default renderer
  var defaultRender = markdownParser.renderer.rules.link_open || function(tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
  };

  markdownParser.renderer.rules.blockquote_close  = function() {
    return '<span class="icon-quote"><span></blockquote>';
  };

  markdownParser.renderer.rules.link_open = function (tokens, idx, options, env, self) {
    // If you are sure other plugins can't add `target` - drop check below
    var aIndex = tokens[idx].attrIndex('target');
    var hrefIndex = tokens[idx].attrIndex('href');
    var hrefString = tokens[idx].attrs[hrefIndex][1];

    if (!hrefString.startsWith('tel:') && !hrefString.startsWith('mailto:')) {
      if (aIndex < 0) {
        tokens[idx].attrPush(['target', '_blank']); // add new attribute
      } else {
        tokens[idx].attrs[aIndex][1] = '_blank';    // replace value of existing attr
      }
    }

    // pass token to default renderer.
    return defaultRender(tokens, idx, options, env, self);
  };

  // Youtube (and non-tested Vimeo)

  // The youtube_parser is from http://stackoverflow.com/a/8260383
  function youtube_parser(url){
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    var match = url.match(regExp);
    if (match&&match[7].length==11){
      return match[7];
    } else{
      return url;
    }
  }

  // The vimeo_parser is from http://stackoverflow.com/a/13286930
  function vimeo_parser(url){
    var regExp = /https?:\/\/(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/;
    var match = url.match(regExp);
    if (match){
      return match[3];
    } else{
      return url;
    }
  }

  function video_embed(md) {
    function video_return(state, silent) {
      var code,
          serviceEnd,
          serviceStart,
          pos,
          res,
          videoID = '',
          tokens,
          token,
          start,
          oldPos = state.pos,
          max = state.posMax;

      // When we add more services, (youtube) might be (youtube|vimeo|vine), for example
      var EMBED_REGEX = /@\[(youtube|vimeo)\]\([\s]*(.*?)[\s]*[\)]/im;


      if (state.src.charCodeAt(state.pos) !== 0x40/* @ */) {
        return false;
      }
      if (state.src.charCodeAt(state.pos + 1) !== 0x5B/* [ */) {
        return false;
      }

      var match = EMBED_REGEX.exec(state.src);

      if(!match){
        return false;
      }

      if (match.length < 3){
        return false;
      }


      var service = match[1];
      var videoID = match[2];
      if (service.toLowerCase() == 'youtube') {
        videoID = youtube_parser(videoID);
      } else if (service.toLowerCase() == 'vimeo') {
        videoID = vimeo_parser(videoID);
      }

      // If the videoID field is empty, regex currently make it the close parenthesis.
      if (videoID === ')') {
        videoID = '';
      }

      serviceStart = state.pos + 2;
      serviceEnd = md.helpers.parseLinkLabel(state, state.pos + 1, false);

      //
      // We found the end of the link, and know for a fact it's a valid link;
      // so all that's left to do is to call tokenizer.
      //
      if (!silent) {
        state.pos = serviceStart;
        state.posMax = serviceEnd;
        state.service = state.src.slice(serviceStart, serviceEnd);
        var newState = new state.md.inline.State(
          service,
          state.md,
          state.env,
          tokens = []
        );
        newState.md.inline.tokenize(newState);

        token = state.push('video', '');
        token.videoID = videoID;
        token.service = service;
        token.level = state.level;
      }

      state.pos = state.pos + state.src.indexOf(')');
      state.posMax = state.tokens.length;
      return true;
    }

    return video_return;
  }

  function tokenize_youtube(videoID) {
    var embedStart = '<div class="embed-responsive embed-responsive-16by9"><iframe class="embed-responsive-item" id="ytplayer" type="text/html" width="640" height="390" src="//www.youtube.com/embed/';
    var embedEnd = '" frameborder="0"></iframe></div>';
    return embedStart + videoID + embedEnd;
  }

  function tokenize_vimeo(videoID) {
    var embedStart = '<div class="embed-responsive embed-responsive-16by9"><iframe class="embed-responsive-item" id="vimeoplayer" width="500" height="281" src="//player.vimeo.com/video/';
    var embedEnd = '" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></div>';
    return embedStart + videoID + embedEnd;
  }

  function tokenize_video(md) {
    function tokenize_return(tokens, idx, options, env, self) {
        var videoID = md.utils.escapeHtml(tokens[idx].videoID);
        var service = md.utils.escapeHtml(tokens[idx].service);
        if (videoID === '') {
            return '';
        }

      if (service.toLowerCase() === 'youtube') {
        return tokenize_youtube(videoID);
      } else if (service.toLowerCase() === 'vimeo') {
          return tokenize_vimeo(videoID);
      } else{
         return('');
      }

    }

    return tokenize_return;
  }
  markdownParser.renderer.rules.video = tokenize_video(markdownParser);
  markdownParser.inline.ruler.before('emphasis', 'video', video_embed(markdownParser));

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
  app.use(route.get('/preview/:ownerUUID/:itemUUID/:previewCode', previewPath));

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

  async function previewPath(ctx, ownerUUID, itemUUID, previewCode) {
    console.log('GET /preview/' + ownerUUID + '/' + itemUUID + '/' + previewCode);
    let context = {};
    if (backendApi){
      let backendResponse = await request.get(backendApi + '/' + ownerUUID + '/item/' +
                                              itemUUID + '/preview/' + previewCode);
      if (backendResponse.status === 200){
        let previewPathData = backendResponse.body;
        context.owner = previewPathData.owner;
        context.note = previewPathData.note;
        if (context.note.content && context.note.format === 'md')
          context.note.content = markdownParser.render(context.note.content);
        ctx.body = render('pages/preview', context);
      }
    }
  }
}
