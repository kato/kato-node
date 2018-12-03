import * as MergeOptions from 'merge-options'
import Context from "../context";
import {Middleware} from "../middleware";

type KatoCorsMethodOptions = ("GET" | "HEAD" | "PUT" | "PATCH" | "POST" | "DELETE")[]

export type KatoCorsOptions = {
  origin: string,
  methods: KatoCorsMethodOptions,
  headers: string[],
  optionsSuccessStatus: number
}

const defaultOptions = {
  origin: '*',
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  // some legacy browsers (IE11, various SmartTVs) choke on 204
  optionsSuccessStatus: 204
};

export default async function cors(ctx: Context, next: Middleware) {
  // 合并配置
  let options = MergeOptions(defaultOptions, ctx.kato.options.cors);

  // headers默认使用req的值
  let headers = ctx.req.headers['access-control-request-headers'];
  if (typeof headers === "string") headers = headers.split ? headers.split(',') : [headers];
  options.headers = ctx.kato.options.cors.headers || headers;

  // 跨域配置
  ctx.res.setHeader("Access-Control-Allow-Origin", options.origin);
  ctx.res.setHeader('Access-Control-Allow-Methods', options.methods.join(","));
  ctx.res.setHeader('Access-Control-Allow-Headers', options.headers.join(","));

  // OPTIONS 请求快速返回
  if (ctx.req.method === 'OPTIONS') {
    ctx.res.statusCode = options.optionsSuccessStatus;
    ctx.res.setHeader('Content-Length', 0);
    ctx.res.end();

    return;
  }

  await next()
}
