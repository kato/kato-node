import Context from "../context";
import {Middleware} from "../middleware";
import {KatoCorsOptions} from "../options";

export default async function cors(ctx: Context, next: Middleware) {
  if (ctx.kato.options.cors) {
    const options = ctx.kato.options.cors as KatoCorsOptions;

    let headers;

    if (options.headers instanceof Array) {
      headers = options.headers.join(',');
    } else {
      //如果配置中没有指定headers,默认从请求中获取
      headers = ctx.req.headers['access-control-request-headers'] || ['Content-Type', 'Content-Length'].join(',');
    }

    // 跨域配置
    ctx.res.setHeader("Access-Control-Allow-Origin", options.origin);
    ctx.res.setHeader('Access-Control-Allow-Methods', options.methods.join(","));
    ctx.res.setHeader('Access-Control-Allow-Headers', headers);

    // OPTIONS 请求快速返回
    if (ctx.req.method === 'OPTIONS') {
      ctx.res.statusCode = options.optionsStatusCode;
      ctx.res.setHeader('Content-Length', 0);
      //跳过正常的返回值转换
      ctx.bypassing = true;

      return;
    }
  }

  await next()
}
