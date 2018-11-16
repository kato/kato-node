import Context from "./context";
import invoker from "./builtin/invoker";
import init from "./builtin/init";
import end from "./builtin/end";
import stub from "./builtin/stub";

//定义中间件的类型
export type Middleware = (ctx?: Context, next?: Middleware) => Promise<void>;

//中间件容器
export class MiddlewareContainer {
  //存储所有的中间件
  private readonly middlewares: Middleware[];
  //存储第一个中间件
  private readonly firstMiddleware: Middleware;

  constructor() {
    //初始化内建的中间件
    this.middlewares = [
      stub,
      init,
      invoker,
      end
    ];
    this.firstMiddleware = this.middlewares[0];
  }

  async do(ctx: Context) {
    let currentMiddlewareIndex = 0;

    const next = async (newCtx?: Context, newNext?: Middleware) => {
      const nextMiddleware = this.middlewares[currentMiddlewareIndex++];
      if (typeof nextMiddleware === 'function') {
        await nextMiddleware.call(null, newCtx || ctx, newNext || next)
      }
    };

    await next(ctx);
  }

  use(middleware: Middleware, locateMiddleware?: Middleware) {
    let index = this.middlewares.findIndex(it => it === (locateMiddleware || this.firstMiddleware));
    if (index < 0)
      index = 0;
    this.middlewares.splice(index, 0, middleware);
  }

  useAfter(middleware: Middleware, locateMiddleware: Middleware) {
    let index = this.middlewares.findIndex(it => it === locateMiddleware);
    if (index < 0)
      index = this.middlewares.length;
    this.middlewares.splice(index + 1, 0, middleware);
  }
}
