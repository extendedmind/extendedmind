import { ArraySlice, getSliceOfArrayWithRemaining, Info, Utils } from "extendedmind-siteutils";
import * as Router from "koa-router";

export class Routing {
  private router = new Router();
  private HEADERS_PER_PAGE: number = 10;

  constructor(
      private backendClient: Utils,
      private backendInfo: Info,
      private headersPath: string,
      private ownersPath: string,
      private extraRoutingModule: string) {
    // SETUP router
    this.router.get("/" + headersPath, this.headers);
    // Short id starts with a number, then follows whatever
    this.router.get("/:sid(\\d\\w*)", this.short);
    this.router.get("/" + ownersPath + "/:handle", this.owner);
    this.router.get("/" + ownersPath + "/:handle/:path", this.note);
    this.router.get("/preview/:ownerUUID/:itemUUID/:previewCode", this.preview);
    if (extraRoutingModule) {
      require(extraRoutingModule).default(this.router);
    }
  }

  // PUBLIC

  public getRoutes(): Router.IMiddleware {
    return this.router.routes();
  }

  public getHelperMethods(): Array<[string, any]> {
    return [
      ["getGeneratedUrls", this.getGeneratedUrls],
      ["getSliceOfArrayWithRemaining", (array, queryParamRemaining) => {
        return getSliceOfArrayWithRemaining(this.HEADERS_PER_PAGE, array, queryParamRemaining);
      }],
    ];
  }

  // ROUTES

  private async headers(ctx: Router.IRouterContext, next: () => Promise<any>) {
    console.info("GET ", ctx.path);
    const publicHeaders = await ctx.state.backendClient.getPublicHeaders();
    const headers = publicHeaders.getNotes([{type: "blacklisted"}]);
    const arrayInfo = ctx.state.getSliceOfArrayWithRemaining(headers, ctx.query.remaining);
    const renderContext: any = {
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
    const owner = publicItems.getOwner();
    const renderContext: any = {
      owner: ctx.state.render.processOwner(owner),
      handle: ctx.params.handle,
    };
    if (!renderContext.owner.blacklisted) {
      const allNotes = publicItems.getNotes().map((note) => ctx.state.render.processNote(note));
      const arrayInfo = ctx.state.getSliceOfArrayWithRemaining(allNotes, ctx.query.remaining);
      renderContext.notes = arrayInfo.arraySlice;
      renderContext.remaining = arrayInfo.remaining;

      // Create an image for this owner if owner image not already processed, and sharing is enabled
      if (renderContext.owner.ui && renderContext.owner.ui.sharing) {
        let imageUrl;
        let secureImageUrl;
        if (!owner.processed || owner.processed.modified !== owner.modified) {
          const imageFileName = await ctx.state.visualization.generateImageFromText(
            renderContext.owner.displayName, renderContext.owner.shortId, owner.modified);
          const generatedUrls = ctx.state.getGeneratedUrls(imageFileName, ctx.state.urlOrigin);
          imageUrl = generatedUrls.url;
          secureImageUrl = generatedUrls.secureUrl;
          publicItems.setOwnerProcessed({
            imageUrl,
            secureImageUrl,
          });
        }else {
          imageUrl = owner.processed.data.imageUrl;
          secureImageUrl = owner.processed.data.secureImageUrl;
        }
        renderContext.imageUrl = imageUrl;
        renderContext.secureImageUrl = secureImageUrl;
      }
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
      const renderContext: any = {
        owner,
        note: ctx.state.render.processNote(note),
        handle: ctx.params.handle,
      };

      // Create an image for this note if image has not already been processed, and sharing is enabled
      if (renderContext.note.ui && renderContext.note.ui.sharing) {
        if (!note.processed || note.processed.modified !== note.modified) {
          const imageFileName = await ctx.state.visualization.generateImageFromText(
            renderContext.note.title, renderContext.note.shortId, note.modified);
          const generatedUrls = ctx.state.getGeneratedUrls(imageFileName, ctx.state.urlOrigin);
          note.processed = {
            modified: note.modified,
            imageUrl: generatedUrls.url,
            secureImageUrl: generatedUrls.secureUrl,
          };
        }
        renderContext.imageUrl = note.processed.imageUrl;
        renderContext.secureImageUrl = note.processed.secureImageUrl;
      }
      ctx.body = ctx.state.render.template("pages/note", renderContext);
    }
  }

  private async preview(ctx: Router.IRouterContext, next: () => Promise<any>) {
    console.info("GET ", ctx.path);
    const previewNote = await ctx.state.backendClient.getPreviewItem(
      ctx.params.ownerUUID, ctx.params.itemUUID, ctx.params.previewCode);

    if (previewNote) {
      const renderContext: any = {
        owner: previewNote.owner,
        note: ctx.state.render.processNote(previewNote),
        preview: true,
      };
      ctx.body = ctx.state.render.template("pages/note", renderContext);
    }
  }

  // HELPER METHODS

  private getGeneratedUrls(fileName: string, urlOrigin: string): any {
    let url;
    let secureUrl;
    if (fileName) {
      url = urlOrigin + "/generated/" + fileName;
      if (urlOrigin.startsWith("https://")) {
        secureUrl = url;
      }
    }
    return {
      url,
      secureUrl,
    };
  }
}
