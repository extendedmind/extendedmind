import { Render } from "./rendering";
import * as Router from "koa-router";
import { Info, Utils } from "extendedmind-siteutils";

export class Routing {
  private router = new Router();

  constructor(private backendClient: Utils,
              private backendInfo: Info) {
    // SETUP router
    this.router.get("/", this.headers);
    this.router.get("/preview/:ownerUUID:/itemUUID/:previewCode", this.preview);
    //this.router.get("/:handle", this.owner);
  }

  // PUBLIC

  public getRoutes(): Router.IMiddleware {
    return this.router.routes();
  }

  // ROUTES

  private async headers(ctx: Router.IRouterContext, next: () => Promise<any>) {
    console.info("GET ", ctx.path);
    const HEADERS_PER_PAGE: number = 10;
    const publicHeaders = await ctx.state.backendClient.getPublicHeaders();
    const headers = publicHeaders.getNotes();
    // How many items were indicated as being not shown previously. If first query, everything is not shown
    const previousRemaining: number = ctx.query.remaining === undefined ? headers.length : ctx.query.remaining;
    // Because new headers might be added to the top of the array, we use remaining to count the index from
    // the end.
    const firstHeaderIndex = headers.length - previousRemaining;
    const headersPortion = headers.slice(firstHeaderIndex, firstHeaderIndex + HEADERS_PER_PAGE);
    const remaining: number = headers.length - (firstHeaderIndex + HEADERS_PER_PAGE) < 0
      ? 0 : headers.length - (firstHeaderIndex + HEADERS_PER_PAGE);
    let renderContext: any = {
      headers: headersPortion,
      remaining: remaining,
    };
    // TODO: add support for basic info of owner from .content field of publicItemsResponse.json
    ctx.body = ctx.state.render.template("pages/headers", renderContext);
  }

  private async owner(ctx: Router.IRouterContext, next: () => Promise<any>) {
    console.info("GET ", ctx.path);
    const publicItems = await ctx.state.backendClient.getPublicItems(ctx.params.handle);
    let renderContext: any = {};
    // TODO: add support for basic info of owner from .content field of publicItemsResponse.json
    ctx.body = ctx.state.render.template("pages/owner", renderContext);
  }

  private preview(ctx: Router.IRouterContext, next: () => Promise<any>) {
    console.info("SDSGET ", ctx.path);
    ctx.body = "preview";
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
