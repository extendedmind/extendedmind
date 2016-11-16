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
    const publicHeaders = await ctx.state.backendClient.getPublicHeaders();
    let renderContext: any = {};
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
