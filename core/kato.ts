import * as mergeOptions from 'merge-options';
import * as http from "http";
import * as prettyJson from 'prettyjson';
import Context from "./context";
import {MiddlewareContainer} from "./middleware";
import {ModuleContainer} from "./module";
import {KatoCorsOptions} from "./middleware/cors";

const debug = require('debug')('kato:core');

type KatoOptions = {
  //是否为开发者模式
  dev?: boolean,
  //是否输出运行时错误
  outputRuntimeError?: boolean,
  //是否为宽松模式,区别在于对string的反序列化上面
  loose?: boolean,
  //文件上传配置
  files?: {
    //存储,模式为内存,详见multer模块
    storage?: any
    //最大文件大小
    maxSize?: number
    //一次最多允许多少个文件上传
    maxCount?: number
  },
  cors?: KatoCorsOptions
}

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
    //初始化配置
    const defaultOptions: KatoOptions = {
      dev: false,
      loose: false,
      outputRuntimeError: true,
      files: {
        storage: null,
        maxCount: 5,
        maxSize: 50000000
      }
    };
    this.options = mergeOptions.call({concatArrays: true}, defaultOptions, options);
    debug(`Kato Options:\n${prettyJson.render(this.options, {noColor: true})}\n`);
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
