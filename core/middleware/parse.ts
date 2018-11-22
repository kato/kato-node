import Context from "../context";
import {Middleware} from "../middleware";
import {KatoRuntimeError} from "../error";

const debug = require('debug')('kato:middle:parse');
const regex = /^\/(?:([^\/]+?))\/(?:([^\/]+?))\.ac$/;

//解析url中的模块名和方法名
export default async function parse(ctx: Context, next: Middleware) {
  const path = ctx.req.url.split('?')[0];
  const match = regex.exec(path);

  //如果路由不匹配
  if (!match) {
    throw new KatoRuntimeError("请求url不符合规范")
  }

  //查找对应的模块和方法
  let moduleName = match[1];
  let methodName = match[2];

  let module = ctx.kato.modules.get(moduleName);
  if (module) {
    let method = module.methods.get(methodName);
    if (method) {
      ctx.module = module;
      ctx.method = method;
      debug(`模块: ${module.name} 方法: ${method.name}`);
      await next()
    } else {
      throw new KatoRuntimeError(`模块${moduleName}中找不到对应的方法${methodName}`);
    }
  } else {
    throw new KatoRuntimeError(`找不到对应的模块${moduleName}`);
  }
}
