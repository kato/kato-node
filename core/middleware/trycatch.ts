import KatoError from "../error";
import {Middleware} from "../middleware";
import Context from "../context";

const debug = require('debug')('kato:middle:trycatch');

export default async function trycatch(ctx: Context, next: Middleware) {
  try {
    //直接传递到下一个中间件
    await next();
  } catch (e) {
    //抓住中间件中的错误
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
