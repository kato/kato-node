import Context from "../../context";
import {Middleware} from "../../middleware";
import {middlewareWrapper} from "../../common/middleware-utils";
import * as bodyParser from "body-parser";
import {IncomingMessage} from "http";
import {reviver} from "../../common/json";

//增强的req,保证静态检查,规范写法
interface ExtendedReq extends IncomingMessage {
  body?: any,
}

//解析post中application/json编码的参数
export default async function jsonBody(ctx: Context, next: Middleware) {
  const req = ctx.req as ExtendedReq;
  const res = ctx.res;

  //解析json类型的数据
  const jsonParser = middlewareWrapper(bodyParser.json({reviver}));
  await jsonParser(req, res);
  const body = req.body;

  //注入到parameters中,application/json类型的post不需要做json的反序列化了
  if (body)
    Object.getOwnPropertyNames(body).forEach(name => {
      if (ctx.method.parameters.findIndex(p => p.name === name) !== -1) {
        ctx.parameters[name] = body[name];
      }
    });

  //删掉中间产生的req.body
  req.body = null;

  await next();
}
