import { Render } from "./rendering";
import * as Router from "koa-router";
import { Info, Utils } from "extendedmind-siteutils";

export class Routing {
  private router = new Router();

  constructor(private backendClient: Utils,
              private backendInfo: Info) {
    // SETUP router
    this.router.get("/", this.index);
    this.router.get("/:handle", this.owner);
  }

  // PUBLIC

  public getRoutes(): Router.IMiddleware {
    return this.router.routes();
  }

  // ROUTES

  private index(ctx: Router.IRouterContext, next: () => Promise<any>) {
    ctx.body = ctx.state.render.template("pages/headers");
    return next();
  }
  private async owner(ctx: Router.IRouterContext, next: () => Promise<any>) {
    console.info("GET ", ctx.path);
    const publicItems = await this.backendClient.getPublicItems(ctx.params.handle);
    let context: any = {};
    // TODO: add support for basic info of owner from .content field of publicItemsResponse.json
    ctx.body = ctx.state.render.template("pages/owner", context);
  }

  private async previewPath(ctx, ownerUUID, itemUUID, previewCode) {
    console.info("GET /preview/" + ownerUUID + "/" + itemUUID + "/" + previewCode);
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
