import * as nunjucks from "nunjucks";
import * as MarkdownIt from "markdown-it";

export class Render {
  private nunjucksEnvironment: nunjucks.Environment;
  private markdownParser: MarkdownIt.MarkdownIt;
  private defaultLinkOpenRenderer: (
            tokens: MarkdownIt.Token[], idx: number,
            options: any, env: any, self: MarkdownIt.MarkdownIt) => any;

  constructor(private extension: string, commonCollectiveName: string, viewsDirectory: string,
              debug: boolean, powered: boolean, urlOrigin: string) {
    this.nunjucksEnvironment =
      this.initializeNunjucs(
        commonCollectiveName, viewsDirectory,
        debug, powered, urlOrigin);
    this.markdownParser = this.initializeMarkdown();
  }

  // PUBLIC INTERFACE

  public template(pathToView:string, context?:any): string{
    pathToView += "." + this.extension;
    return this.nunjucksEnvironment.render(pathToView, context);
  };
  public markdown(content:string): string{
    return this.markdownParser.render(content);
  };

  // NUNJUCKS

  private initializeNunjucs(commonCollectiveName: string, viewsDirectory: string,
                            debug: boolean, powered: boolean, urlOrigin: string): nunjucks.Environment{
    let nj: nunjucks.Environment = nunjucks.configure(viewsDirectory, {
      autoescape: true,
      noCache: debug,
      watch: debug
    });

    nj.addGlobal("commonCollectiveName", commonCollectiveName);
    nj.addGlobal("development", debug);
    nj.addGlobal("urlOrigin", urlOrigin);
    if (powered) nj.addGlobal("powered", true);

    // Add utility methods
    nj.addGlobal("formatDate", this.formatDate);

    let domain;
    if (urlOrigin && urlOrigin.startsWith("https://")){
      domain = urlOrigin.substr(8);
    }else if (urlOrigin && urlOrigin.startsWith("http://")){
      domain = urlOrigin.substr(7);
    }else{
      // Fail if urlOrigin is invalid
      throw new Error("FATAL: urlOrigin invalid or not set, exiting");
    }
    nj.addGlobal("domain", domain);
    return nj;
  }

  // MARKDOWN-IT

  private initializeMarkdown(): MarkdownIt.MarkdownIt{

    let mp: MarkdownIt.MarkdownIt = new MarkdownIt();

    // Open links to new tab.
    // https://github.com/markdown-it/markdown-it/blob/master/docs/architecture.md#renderer

    // Remember old renderer, if overriden, or proxy to default renderer
    this.defaultLinkOpenRenderer = mp.renderer.rules["link_open"] || function(tokens, idx, options, env, self) {
      return self["renderToken"](tokens, idx, options);
    };

    mp.renderer.rules["link_open"] = function (tokens, idx, options, env, self) {
      // If you are sure other plugins can't add `target` - drop check below
      var aIndex = tokens[idx].attrIndex("target");
      var relIndex = tokens[idx].attrIndex("rel");
      var hrefIndex = tokens[idx].attrIndex("href");
      var hrefString = tokens[idx].attrs[hrefIndex][1];

      if (!hrefString.startsWith("tel:") && !hrefString.startsWith("mailto:")) {
        if (aIndex < 0) {
          tokens[idx].attrPush(["target", "_blank"]); // add new attribute
        } else {
          tokens[idx].attrs[aIndex][1] = "_blank";    // replace value of existing attr
        }
        if (relIndex < 0) {
          tokens[idx].attrPush(["rel", "noopener"]); // add new attribute
        } else {
          tokens[idx].attrs[relIndex][1] = "noopener";    // replace value of existing attr
        }
      }

      // pass token to default renderer.
      return this.defaultLinkOpenRenderer(tokens, idx, options, env, self);
    };
    mp.renderer.rules["video"] = this.tokenize_video(this.markdownParser);
    mp.inline.ruler.before("emphasis", "video", this.video_embed(mp));

    return mp;
  }

  // Youtube (and non-tested Vimeo)

  // The youtube_parser is from http://stackoverflow.com/a/8260383
  private youtube_parser(url){
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    var match = url.match(regExp);
    if (match&&match[7].length==11){
      return match[7];
    } else{
      return url;
    }
  }

  // The vimeo_parser is from http://stackoverflow.com/a/13286930
  private vimeo_parser(url){
    var regExp = /https?:\/\/(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/;
    var match = url.match(regExp);
    if (match){
      return match[3];
    } else{
      return url;
    }
  }

  private video_embed(md:MarkdownIt.MarkdownIt) {
    function video_return(state) {
      var code,
          serviceEnd,
          serviceStart,
          pos,
          res,
          videoID = "",
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
      if (service.toLowerCase() == "youtube") {
        videoID = this.youtube_parser(videoID);
      } else if (service.toLowerCase() == "vimeo") {
        videoID = this.vimeo_parser(videoID);
      }

      // If the videoID field is empty, regex currently make it the close parenthesis.
      if (videoID === ")") {
        videoID = "";
      }

      serviceStart = state.pos + 2;
      serviceEnd = md.helpers.parseLinkLabel(state, state.pos + 1, false);

      //
      // We found the end of the link, and know for a fact it's a valid link;
      // so all that's left to do is to call tokenizer.
      //
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

      token = state.push("video", "");
      token.videoID = videoID;
      token.service = service;
      token.level = state.level;

      state.pos = state.pos + state.src.indexOf(")");
      state.posMax = state.tokens.length;
      return true;
    }

    return video_return;
  }

  private tokenize_youtube(videoID) {
    var embedStart = '<div class="embed-responsive embed-responsive-16by9"><iframe class="embed-responsive-item" id="ytplayer" type="text/html" width="640" height="390" src="//www.youtube.com/embed/';
    var embedEnd = '" frameborder="0"></iframe></div>';
    return embedStart + videoID + embedEnd;
  }

  private tokenize_vimeo(videoID) {
    var embedStart = '<div class="embed-responsive embed-responsive-16by9"><iframe class="embed-responsive-item" id="vimeoplayer" width="500" height="281" src="//player.vimeo.com/video/';
    var embedEnd = '" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></div>';
    return embedStart + videoID + embedEnd;
  }

  private tokenize_video(md) {
    function tokenize_return(tokens, idx, options, env, self) {
        var videoID = md.utils.escapeHtml(tokens[idx].videoID);
        var service = md.utils.escapeHtml(tokens[idx].service);
        if (videoID === "") {
            return "";
        }

      if (service.toLowerCase() === "youtube") {
        return this.tokenize_youtube(videoID);
      } else if (service.toLowerCase() === "vimeo") {
          return this.tokenize_vimeo(videoID);
      } else{
        return("");
      }
    }
    return tokenize_return;
  }

  // UTILITY CLASSES

  private formatDate(timestamp: number): string {
    return new Date(timestamp).toDateString();
  }
}