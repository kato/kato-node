import Context from "../context";
import {Middleware} from "../middleware";
import KatoError from "../error";

//最后的中间件,用于把context中的东西输出到http连接
export default async function end(ctx: Context, next: Middleware) {
  //拿到res,并设置属性
  const res = ctx.res;
  res.setHeader("Content-Type", "application/json");

  if (ctx.error) {
    //响应错误
    let err = ctx.error;
    if (err ! instanceof KatoError) {
      err = new KatoError(err.message)
    }
    res.end(JSON.stringify({
      code: err.code,
      message: err.message
    }))
  } else {
    //返回成功
    res.end(JSON.stringify({
      code: 0,
      data: ctx.result
    }))
  }
  
  //继续下一个中间件,如果有需要的话
  await next();
}
