import Context from "./context";
import KatoError from "./error";
import {MiddlewareContainer} from "./middleware";
import {ModuleContainer} from "./module";

const debug = require('debug')('kato:core');

export default class Kato {
  //中间件容器
  middlewares = new MiddlewareContainer();
  //模块容器
  modules = new ModuleContainer();

  //添加中间件
  use = this.middlewares.use.bind(this.middlewares);
  //添加中间件
  useAfter = this.middlewares.useAfter.bind(this.middlewares);

  //加载api模块
  load = this.modules.load.bind(this.modules);

  //执行来自适配器过来的实例
  async do(ctx: Context) {
    try {
      ctx.kato = this;
      //交给中间件去处理
      await this.middlewares.do(ctx);
    } catch (e) {
      //抓住中间件中没有处理的错误
      debug(`中间件出现异常 : ${e}`);
      let err = e;
      if (!(e instanceof KatoError)) {
        err = new KatoError(e.message)
      }
      const res = ctx.res;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({
        code: err.code,
        message: err.message
      }))
    }
  }
}
