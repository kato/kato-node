import Context from "./context";
import KatoError from "./error";
import {MiddlewareContainer} from "./middleware";
import {ModuleContainer} from "./module";

const debug = require('debug')('kato:core');

export default class Kato {
  //中间件容器
  private middlewareContainer = new MiddlewareContainer();
  //模块容器
  private moduleContainer = new ModuleContainer();

  //添加中间件
  use = this.middlewareContainer.use.bind(this.middlewareContainer);
  //添加中间件
  useAfter = this.middlewareContainer.useAfter.bind(this.middlewareContainer);

  //加载api模块
  load = this.moduleContainer.load.bind(this.moduleContainer);

  //执行来自适配器过来的实例
  async do(ctx: Context) {
    try {
      //交给中间件去处理
      await this.middlewareContainer.do(ctx);
    } catch (e) {
      //抓住中间件中没有处理的错误
      debug(`中间件处理过程中出现未捕获的异常 : ${e}`);
      let err = e;
      if (!(e instanceof KatoError)) {
        err = new KatoError(e.message)
      }
      const res = ctx.res;
      res.setHeader("Context-Type", "application/json");
      res.end(JSON.stringify({
        code: err.code,
        message: err.message
      }))
    }
  }
}
