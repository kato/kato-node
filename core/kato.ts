import Context from "./context";
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
    ctx.kato = this;
    //交给中间件去处理
    await this.middlewares.do(ctx);
  }
}
