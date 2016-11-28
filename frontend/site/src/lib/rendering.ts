import * as nunjucks from "nunjucks";
import * as MarkdownIt from "markdown-it";

export class Render {
  private nunjucksEnvironment: nunjucks.Environment;
  private contentMarkdownParser: MarkdownIt.MarkdownIt;

  constructor(private extension: string, commonCollectiveName: string, viewsDirectory: string,
              debug: boolean, powered: boolean, urlOrigin: string, ownersPath: string, headersPath: string) {
    this.nunjucksEnvironment =
      this.initializeNunjucs(
        commonCollectiveName, viewsDirectory,
        debug, powered, urlOrigin, ownersPath, headersPath);
    this.contentMarkdownParser = this.initializeFullMarkdown();
  }

  // PUBLIC INTERFACE

  // Simple Nunjucks processor
  public template(pathToView:string, context?:any): string{
    pathToView += "." + this.extension;
    return this.nunjucksEnvironment.render(pathToView, context);
  };
  // Simple markdown processor
  public markdown(content:string): string{
    return this.contentMarkdownParser.render(content);
  };
  // Process entire note into a usable object
  public processNote(note: any): any {
    let processedNote: any = {
      uuid: note.uuid,
      modified: note.modified,
      path: note.visibility.path,
      published: note.visibility.published,
      title: note.title,
    };
    if (note.content) {
      processedNote.content = this.contentMarkdownParser.render(note.content);
    }
    if (note.keywords) {
      processedNote.keywords = note.keywords;
    }
    if (note.assignee) {
      processedNote.assignee = note.assignee;
    }
    return processedNote;
  };

  // NUNJUCKS

  private initializeNunjucs(commonCollectiveName: string, viewsDirectory: string,
                            debug: boolean, powered: boolean, urlOrigin: string,
                            ownersPath: string, headersPath: string): nunjucks.Environment{
    let nj: nunjucks.Environment = nunjucks.configure(viewsDirectory, {
      autoescape: true,
      noCache: debug,
      watch: debug
    });

    nj.addGlobal("commonCollectiveName", commonCollectiveName);
    nj.addGlobal("development", debug);
    nj.addGlobal("urlOrigin", urlOrigin);
    nj.addGlobal("ownersPath", ownersPath);
    nj.addGlobal("headersPath", headersPath);
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

  private initializeFullMarkdown(): MarkdownIt.MarkdownIt{
    let mp: MarkdownIt.MarkdownIt = new MarkdownIt();
    mp.enable("linkify");
    mp.renderer.rules["video"] = this.tokenize_video(mp);
    mp.inline.ruler.before("emphasis", "video", this.video_embed(mp));
    return mp;
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

  // UTILITY CLASSES

  private formatDate(timestamp: number): string {
    return new Date(timestamp).toDateString();
  }
}