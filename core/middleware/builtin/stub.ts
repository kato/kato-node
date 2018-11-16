import Context from "../context";
import {Middleware} from "../container";

//存根信息中间件,用于相应客户端的存根信息
export default async function stub({req, res}: Context, next: Middleware) {
  if (req.url === "/stub.json") {
    res.end("stub.js")
  } else
    await next()
}
