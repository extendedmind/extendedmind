import * as Router from "koa-router";
import { Info, Utils } from "extendedmind-siteutils";

export class Routing {
  private router = new Router();

  constructor(private backendClient: Utils,
              private backendInfo: Info,
              private ownersPath: string) {
    // SETUP router
    this.router.get("/", this.headers);
    // Short id starts with a number, then follows whatever
    this.router.get("/:sid(\\d\\w*)", this.short);
    this.router.get("/" + ownersPath + "/:handle", this.owner);
    this.router.get("/" + ownersPath + "/:handle/:path", this.note);
    this.router.get("/preview/:ownerUUID/:itemUUID/:previewCode", this.preview);
  }

  // PUBLIC

  public getRoutes(): Router.IMiddleware {
    return this.router.routes();
  }

  // ROUTES

  private async headers(ctx: Router.IRouterContext, next: () => Promise<any>) {
    console.info("GET ", ctx.path);
    const publicHeaders = await ctx.state.backendClient.getPublicHeaders();
    const headers = publicHeaders.getNotes([{type: "blacklisted"}]);
    let arrayInfo = ctx.state.getSliceOfArrayWithRemaining(headers, ctx.query.remaining);
    let renderContext: any = {
      headers: arrayInfo.arraySlice,
      remaining: arrayInfo.remaining,
    };
    ctx.body = ctx.state.render.template("pages/headers", renderContext);
  }

  private async short(ctx: Router.IRouterContext, next: () => Promise<any>) {
    console.info("GET ", ctx.path);
    const shortIdInfo = await ctx.state.backendClient.getShortId(ctx.params.sid);
    if (shortIdInfo) {
      let redirectPath = "/" + ctx.state.ownersPath + "/" + shortIdInfo.handle;
      if (shortIdInfo.path) {
        redirectPath += "/" + shortIdInfo.path;
      }
      ctx.redirect(redirectPath);
      ctx.status = 301;
    }
  }

  private async owner(ctx: Router.IRouterContext, next: () => Promise<any>) {
    console.info("GET ", ctx.path);
    const publicItems = await ctx.state.backendClient.getPublicItems(ctx.params.handle);
    let renderContext: any = {
      owner: ctx.state.render.processOwner(publicItems.getOwner()),
      handle: ctx.params.handle,
    };
    if (!renderContext.owner.blacklisted) {
      const allNotes = publicItems.getNotes().map(note => ctx.state.render.processNote(note));
      let arrayInfo = ctx.state.getSliceOfArrayWithRemaining(allNotes, ctx.query.remaining);
      renderContext.notes = arrayInfo.arraySlice;
      renderContext.remaining = arrayInfo.remaining;
      // TODO: add support for basic info of owner from .content field of publicItemsResponse.json
      ctx.body = ctx.state.render.template("pages/owner", renderContext);
    }else {
      ctx.status = 404;
    }
  }

  private async note(ctx: Router.IRouterContext, next: () => Promise<any>) {
    console.info("GET ", ctx.path);
    const publicItems = await ctx.state.backendClient.getPublicItems(ctx.params.handle);
    const note = publicItems.getNote(ctx.params.path);
    const owner = publicItems.getOwner();
    if (note && !owner.blacklisted) {
      let renderContext: any = {
        owner: owner,
        note: ctx.state.render.processNote(note),
        handle: ctx.params.handle,
      };

      // Create an image for this
      const imageFileName = ctx.state.visualization.generateImageFromText(
        renderContext.note.title, renderContext.note.shortId);
      if (imageFileName){
        renderContext.imageUrl = ctx.state.urlOrigin + "/static/img/" + imageFileName;
        if (ctx.state.urlOrigin.startsWith("https://")){
          renderContext.secureImageUrl = ctx.state.urlOrigin + "/static/img/" + renderContext.note.shortId;
        }
      }
      ctx.body = ctx.state.render.template("pages/note", renderContext);
    }
  }

  private async preview(ctx: Router.IRouterContext, next: () => Promise<any>) {
    console.info("GET ", ctx.path);
    const previewNote = await ctx.state.backendClient.getPreviewItem(
      ctx.params.ownerUUID, ctx.params.itemUUID, ctx.params.previewCode);

    if (previewNote) {
      let renderContext: any = {
        owner: previewNote.owner,
        note: ctx.state.render.processNote(previewNote),
        preview: true,
      };
      ctx.body = ctx.state.render.template("pages/note", renderContext);
    }
  }

}
