import {Middleware} from "../middleware";
import Context from "../context";
import {jsonStringify} from "../common/json";
import {KatoError, KatoRuntimeError} from "../error";

const debug = require('debug')('kato:middle:respond');

export default async function respond(ctx: Context, next: Middleware) {
  const res = ctx.res;

  try {
    //直接传递到下一个中间件
    await next();

    //如果跳过正常响应,或者res处于不可写的状态,则直接返回
    if (ctx.bypassing || !res.writable)
      return;

    //处理正常的返回
    res.setHeader("Content-Type", "application/json");
    res.body = jsonStringify(ctx.result);
  } catch (e) {
    //抓住中间件中的错误
    let err = e;
    if (!(e instanceof KatoError)) {
      //如果不是一个KatoError,可以将它转化为KatoError
      err = new KatoRuntimeError(e.message);
      err.stack = e.stack || '';
    }
    //准备输出错误信息到http连接
    res.setHeader("Content-Type", "application/json");
    res.body = jsonStringify({
      _KatoErrorCode_: err.code,
      _KatoErrorMessage_: err.message,
      _KatoErrorStack_: ctx.kato.options.dev ? err.stack : ''
    });
    if (ctx.kato.options.outputRuntimeError) {
      //输出到http的同时,针对运行时错误,还需要输出到控制台,以便记录
      if (err instanceof KatoRuntimeError) {
        console.error(err);
      }
    }
  }
}
