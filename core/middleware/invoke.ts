import Context from "../context";
import {Middleware} from "../middleware";

//调用中间件,用于调用真实的方法
export default async function invoke(ctx: Context, next: Middleware) {
  //初始化参数
  const args = ctx.method.parameters.map(p => ctx.parameters[p.name]);
  //实例化module
  const module = new ctx.module.module();
  //代理context
  const moduleProxy = new Proxy(module, {
    get(target: any, key: PropertyKey): any {
      if (key === 'context') {
        console.warn('kato: 通过this.context来获取上下文的方式已经过时,请使用Context.current来获取当前执行的上下文');
        return ctx;
      } else {
        return target[key]
      }
    }
  });
  //调用方法,同时也处理好异步
  ctx.result = await ctx.method.method.apply(moduleProxy, args);

  //继续下一个中间件,如果有需要的话
  await next();
}
