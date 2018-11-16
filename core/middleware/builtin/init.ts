import Context from "../context";
import {Middleware} from "../container";

//初始化中间件,用于初始化context中的一些属性
export default async function init(ctx: Context, next: Middleware) {
  await next()
}
