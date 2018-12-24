import * as http from "http";
import {createNamespace} from 'cls-hooked';
import Context from "./context";
import {MiddlewareContainer} from "./middleware";
import {ModuleContainer} from "./module";
import {getOptions, KatoOptions} from "./options";
import {IncomingMessage, ServerResponse} from "http";
import {transformer} from "./http/transformer";

const debug = require('debug')('kato:core');

//CLS存储空间
export const katoCLS = createNamespace('kato');

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
  async do(req: IncomingMessage, res: ServerResponse) {
    return await katoCLS.runAndReturn(async () => {
      //新建一个kato的context
      const ctx = new Context(req, res);
      ctx.kato = this;
      //交给中间件去处理
      await this.middlewares.do(ctx);
      //中间件处理完毕,开始把res的结果输出到http
      transformer(ctx.res)
    });
  }

  //启动原生服务器
  async listen(port: number, hostname: string = "localhost") {
    return new Promise(((resolve, reject) => {
      this.server = http.createServer(this.do.bind(this));
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
