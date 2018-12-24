import {createNamespace} from 'cls-hooked'
import {ModuleDescriptor, MethodDescriptor} from "./module";
import Kato from "./kato";
import {createRequest, KatoRequest} from "./http/request";
import {createResponse, KatoResponse} from "./http/response";
import {IncomingMessage, ServerResponse} from "http";

const contextSymbol = Symbol('kato-context');

//当前上下文
export const katoCLS = createNamespace('kato');

export default class Context {
  //获取当前的异步路径的上下文
  public static get current(): Context {
    return katoCLS.get(contextSymbol)
  }

  //kato实例
  public kato: Kato;

  //kato的请求和响应
  public req: KatoRequest;
  public res: KatoResponse;

  //模块,方法以及调用的参数,这三个值在中间件解析的过程中逐渐填充
  public module: ModuleDescriptor;
  public method: MethodDescriptor;
  public parameters: any = {};

  //调用结果,invoke中间件填充
  public result: any;

  //是否由respond中间件来把result或者异常转换为KatoResponse的输出
  public bypassing = false;

  /**
   * 初始化一个kato上下文
   * @param req 原生的http请求
   * @param res 原生的http响应
   */
  constructor(req: IncomingMessage, res: ServerResponse) {
    this.req = createRequest(req);
    this.res = createResponse(res);

    //注入到当前上下文中
    katoCLS.set(contextSymbol, this);
  }
}
