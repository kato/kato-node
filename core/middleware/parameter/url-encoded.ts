import Context from "../../context";
import {Middleware} from "../../middleware";
import {IncomingMessage} from "http";
import {middlewareWrapper} from "../../common/middleware-utils";
import * as bodyParser from "body-parser";
import {jsonParse} from "../../common/json";
import {KatoRuntimeError} from "../../error";

//增强的req,保证静态检查,规范写法
interface ExtendedReq extends IncomingMessage {
  body?: any,
}

//解析post中url-encoded编码的参数
export default async function urlEncoded(ctx: Context, next: Middleware) {
  const req = ctx.req as ExtendedReq;
  const res = ctx.res;

  //解析json类型的数据
  const jsonParser = middlewareWrapper(bodyParser.urlencoded({extended: false}));
  await jsonParser(req, res);
  const body = req.body;

  //注入到parameters中
  if (req.body)
    Object.getOwnPropertyNames(body).forEach(name => {
      if (ctx.method.parameters.findIndex(p => p.name === name) !== -1) {
        try {
          ctx.parameters[name] = jsonParse(req.body[name]);
        } catch (e) {
          //如果是loose模式,则当出现无法解析的情况的时候,把它转换为字符串再解析
          if (ctx.kato.options.loose)
            ctx.parameters[name] = jsonParse(JSON.stringify(body[name]));
          else
            throw new KatoRuntimeError(e.message);
        }
      }
    });

  //删掉中间产生的req.body
  req.body = null;

  await next();
}
