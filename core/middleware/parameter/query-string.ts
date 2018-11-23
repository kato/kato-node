import Context from "../../context";
import {Middleware} from "../../middleware";
import * as url from "url";
import * as qs from 'qs';
import {jsonParse} from "../../common/json";
import {KatoRuntimeError} from "../../error";

//解析来自query的参数
export default async function queryString(ctx: Context, next: Middleware) {
  //解析query string
  const query = qs.parse(url.parse(ctx.req.url).query);

  //注入到parameters中
  if (query)
    Object.getOwnPropertyNames(query).forEach(name => {
      if (ctx.method.parameters.findIndex(p => p.name === name) !== -1) {
        try {
          ctx.parameters[name] = jsonParse(query[name]);
        } catch (e) {
          //如果是loose模式,则当出现无法解析的情况的时候,把它转换为字符串再解析
          if (ctx.kato.options.loose)
            ctx.parameters[name] = jsonParse(JSON.stringify(query[name]));
          else
            throw new KatoRuntimeError(e.message);
        }
      }
    });

  await next();
}
