import Context from "../context";
import {Middleware} from "../middleware";
import {jsonStringify} from "../common/json";

//最后的中间件,用于把context中的东西输出到http连接
export default async function end(ctx: Context, next: Middleware) {
  //拿到res,并设置属性
  const res = ctx.res;
  res.setHeader("Content-Type", "application/json");
  //end只需要处理正常的返回
  res.end(jsonStringify({
    code: 0,
    data: ctx.result
  }));

  //继续下一个中间件,如果有需要的话
  await next();
}
