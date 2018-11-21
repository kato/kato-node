import Context from "../context";
import {Middleware} from "../middleware";
import parameter from "./parameter";

//调用中间件,用于调用真实的方法
export default async function invoke(ctx: Context, next: Middleware) {
  //初始化参数
  const args = ctx.method.parameters.map(p => ctx.parameters[p.name]);
  //实例化module
  const module = new ctx.module.module();
  //注入context
  module.context = ctx;
  //调用方法,同时也处理好异步
  ctx.result = await ctx.method.method.apply(module, args);
  await next()
}
