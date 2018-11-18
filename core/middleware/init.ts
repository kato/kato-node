import Context from "../context";
import {Middleware} from "../middleware";

const debug = require('debug')('kato:middle:init');
const regex = /^\/(?:([^\/]+?))\/(?:([^\/]+?))\.ac$/;

//初始化中间件,用于初始化context中的一些属性
export default async function init(ctx: Context, next: Middleware) {
  const path = ctx.req.url.split('?')[0];
  const match = regex.exec(path);
  ctx.moduleName = match[1];
  ctx.methodName = match[2];

  debug(`模块: ${ctx.moduleName} 方法: ${ctx.methodName}`);

  await next()
}
