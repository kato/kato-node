import Context from "../context";
import {Middleware} from "../middleware";

//调用中间件,用于调用真实的方法
export default async function invoke(ctx: Context, next: Middleware) {
  ctx.result = new Date();
  await next()
}
