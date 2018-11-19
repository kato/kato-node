import Context from "../context";
import {Middleware} from "../middleware";
import KatoError from "../error";

const debug = require('debug')('kato:middle:init');
const regex = /^\/(?:([^\/]+?))\/(?:([^\/]+?))\.ac$/;

//初始化中间件,用于初始化context中的一些属性
export default async function init(ctx: Context, next: Middleware) {
  const path = ctx.req.url.split('?')[0];
  const match = regex.exec(path);
  let moduleName = match[1];
  let methodName = match[2];

  //查找对应的模块和方法
  let module = ctx.kato.modules.get(moduleName);
  if (module) {
    let method = module.methods.get(methodName);
    if (method) {
      ctx.module = module;
      ctx.method = method;
      debug(`模块: ${module.name} 方法: ${method.name}`);
      await next()
    } else {
      throw new KatoError(`模块${moduleName}中找不到对应的方法${methodName}`);
    }
  } else {
    throw new KatoError(`找不到对应的模块${moduleName}`);
  }
}
