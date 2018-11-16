import Context from "../context";
import {Middleware} from "../container";

//调用中间件,用于调用真实的方法
export default async function invoker(ctx: Context, next: Middleware) {
  ctx.result = new Date();
  await next()
}
