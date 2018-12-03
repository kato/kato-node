import * as http from "http";
import Context from "./context";
import {MiddlewareContainer} from "./middleware";
import {ModuleContainer} from "./module";
import {getOptions, KatoOptions} from "./options";

const debug = require('debug')('kato:core');

export default class Kato {
  //中间件容器
  middlewares = new MiddlewareContainer();
  //模块容器
  modules = new ModuleContainer();
  //配置
  options: KatoOptions;
  //原生服务器,node自带的,当不使用第三方框架的时候使用
  server?: http.Server;

  constructor(options: KatoOptions = {}) {
    this.options = getOptions(options);
  }

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

  //启动原生服务器
  async listen(port: number, hostname: string = "localhost") {
    return new Promise(((resolve, reject) => {
      this.server = http.createServer((req, res) => this.do(new Context(req, res)));
      this.server.listen.call(this.server, port, hostname, err => {
        err ? reject(err) : resolve();
      });
    }));
  };

  //关闭node原生服务器
  async close() {
    return new Promise(resolve => {
      this.server.close.call(this.server, () => {
        resolve();
      });
    })
  };
}
