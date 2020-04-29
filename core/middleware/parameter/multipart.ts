import Context from "../../context";
import {Middleware} from "../../middleware";
import {IncomingMessage} from "http";
import {middlewareWrapper} from "../../common/middleware-utils";
import * as multer from 'multer';
import {jsonParse} from "../../common/json";
import {KatoRuntimeError} from "../../error";

//增强的req,保证静态检查,规范写法
interface ExtendedReq extends IncomingMessage {
  body?: any,
  files?: any[],
}

//解析post中multipart参数
export default async function multipart(ctx: Context, next: Middleware) {
  const req = ctx.req as ExtendedReq;
  const res = ctx.res;

  //解析multipart数据
  const multipartParser = middlewareWrapper(multer({
    storage: ctx.kato.options.files.storage ?? multer.memoryStorage(),
    limits: {
      files: ctx.kato.options.files.maxCount,
      fileSize: ctx.kato.options.files.maxSize
    },
  }).any());
  await multipartParser(req, res);

  //文件解析
  req.files && req.files.forEach(file => {
    if (ctx.method.parameters.findIndex(p => p.name === file.fieldname) !== -1) {
      (ctx.parameters[file.fieldname] = (ctx.parameters[file.fieldname] ?? [])).push(file);
    }
  });

  //multipart模式下,文件以外的字段在req.body中,所以同样也需要解析
  if (req.body)
    Object.getOwnPropertyNames(req.body).forEach(name => {
      if (ctx.method.parameters.findIndex(p => p.name === name) !== -1) {
        try {
          ctx.parameters[name] = jsonParse(req.body[name]);
        } catch (e) {
          //如果是loose模式,则当出现无法解析的情况的时候,把它转换为字符串再解析
          if (ctx.kato.options.loose)
            ctx.parameters[name] = jsonParse(JSON.stringify(req.body[name]));
          else
            throw new KatoRuntimeError(e.message);
        }
      }
    });

  //删掉中间产生的req.body和req.files
  req.body = null;
  req.files = null;

  await next();
}
