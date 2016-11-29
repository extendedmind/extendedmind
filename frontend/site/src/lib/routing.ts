import { Render } from "./rendering";
import * as Router from "koa-router";
import { Info, Utils } from "extendedmind-siteutils";

export class Routing {
  private router = new Router();

  constructor(private backendClient: Utils,
              private backendInfo: Info,
              private ownersPath: string) {
    // SETUP router
    this.router.get("/", this.headers);
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

  private async owner(ctx: Router.IRouterContext, next: () => Promise<any>) {
    console.info("GET ", ctx.path);
    const publicItems = await ctx.state.backendClient.getPublicItems(ctx.params.handle);
    let renderContext: any = {
      owner: publicItems.getOwner(),
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
      ctx.body = ctx.state.render.template("pages/note", renderContext);
    }
  }


  private preview(ctx: Router.IRouterContext, next: () => Promise<any>) {
    console.info("GET ", ctx.path);
    /*
    let context = {};
    if (backendApi) {
      let backendResponse = await request.get(backendApi + "/" + ownerUUID + "/item/" +
                                              itemUUID + "/preview/" + previewCode);
      if (backendResponse.status === 200) {
        let previewPathData = backendResponse.body;
        context.owner = previewPathData.owner;
        context.note = previewPathData.note;
        if (context.note.content && context.note.format === "md")
          context.note.content = markdownParser.render(context.note.content);
        ctx.body = ctx.state.render.template("pages/preview", context);
      }
    }
    */
  }

}
