import Context from "../context";
import {Middleware} from "../middleware";

type KatoCorsMethodOption = ("GET" | "POST" | "PUT" | "DELETE" | "OPTIONS")[]

export type KatoCorsOptions = {
  origin: string,
  methods: KatoCorsMethodOption,
  headers: string[]
}

export default async function cors(ctx: Context, next: Middleware) {
  const options = ctx.kato.options.cors;

  if (options) {
    if (options.origin) ctx.res.setHeader("Access-Control-Allow-Origin", options.origin);
    if (options.methods) ctx.res.setHeader('Access-Control-Allow-Methods', options.methods.join(","));
    if (options.headers) ctx.res.setHeader('Access-Control-Allow-Headers', options.headers.join(","));
  }

  await next()
}
