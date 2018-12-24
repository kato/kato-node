import Context from "../context";
import {Middleware} from "../middleware";

const debug = require('debug')('kato:middle:stub');

//缓存
let stubCache;

//清除stub缓存
export function cleanStubCache() {
  stubCache = null
}

//存根信息中间件,用于相应客户端的存根信息
export default async function stub(ctx: Context, next: Middleware) {
  if (ctx.req.url === "/stub.json") {
    if (!stubCache) {
      //构建缓存
      const stub = {
        modules: []
      };
      for (const [moduleName, module] of ctx.kato.modules) {
        const moduleStub = {
          name: moduleName,
          methods: []
        };
        for (const [methodName, method] of module.methods) {
          moduleStub.methods.push({
            name: methodName,
            parameters: method.parameters.map(it => ({name: it.name, type: it.type}))
          })
        }
        stub.modules.push(moduleStub);
      }
      stubCache = JSON.stringify(stub);

      debug('生成stub')
    }

    ctx.res.setHeader("Content-Type", "application/json");
    ctx.res.body = stubCache;
    //跳过正常的返回转换
    ctx.bypassing = true;
  } else
    await next()
}
