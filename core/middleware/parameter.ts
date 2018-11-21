import Context from "../context";
import {Middleware} from "../middleware";
import * as bodyParser from 'body-parser';
import * as multer from 'multer';
import * as  url from 'url';
import * as  qs from 'qs';
import {middlewareWrapper} from "../common/middleware-utils";
import {IncomingMessage} from "http";
import {jsonParse} from "../common/json";

const debug = require('debug')('kato:middle:parameter');

//增强的req,保证静态检查,规范写法
interface ExtendedReq extends IncomingMessage {
  body: any,
  files: any[]
}

//解析请求中的的参数
export default async function parameter(ctx: Context, next: Middleware) {
  const req = ctx.req as ExtendedReq;
  const res = ctx.res;

  //解析query string
  const query = qs.parse(url.parse(req.url).query);

  //解析json类型的数据
  const jsonParser = middlewareWrapper(bodyParser.json());
  await jsonParser(req, res);

  //解析url-encoded类型的数据
  const urlEncodedParser = middlewareWrapper(bodyParser.urlencoded({extended: true}));
  await urlEncodedParser(req, res);

  //解析multipart数据
  const multipartParser = middlewareWrapper(multer({
    storage: multer.memoryStorage(),
    limits: {
      files: ctx.kato.options.files.maxCount,
      fileSize: ctx.kato.options.files.maxSize
    },
  }).any());
  await multipartParser(req, res);

  //分别从query,body,multipart中取到对应的部分来填充参数
  //填充优先级 multipart > body > query
  //query && body
  const combined = {...query, ...req.body};
  Object.getOwnPropertyNames(combined).forEach(name => {
    if (ctx.method.parameters.findIndex(p => p.name === name) !== -1) {
      try {
        ctx.parameters[name] = jsonParse(combined[name]);
      } catch (e) {
        //如果是loose模式,则当出现无法解析的情况的时候,把它转换为字符串再解析
        if (ctx.kato.options.loose)
          ctx.parameters[name] = jsonParse(JSON.stringify(combined[name]));
        else
          throw e;
      }
    }
  });

  //multipart
  req.files && req.files.forEach(file => {
    if (ctx.method.parameters.findIndex(p => p.name === file.fieldname) !== -1) {
      ctx.parameters[file.fieldname] = file;
    }
  });

  await next();
}
