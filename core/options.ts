import * as mergeOptions from 'merge-options';
import * as prettyJson from 'prettyjson';

const debug = require('debug')('kato:options');

type KatoCorsMethodOptions = ("GET" | "HEAD" | "PUT" | "PATCH" | "POST" | "DELETE")[]

export type KatoCorsOptions = {
  origin?: string,
  methods?: KatoCorsMethodOptions,
  headers?: string[],
  optionsStatusCode?: number
}

export type KatoOptions = {
  //是否为开发者模式
  dev?: boolean,
  //是否输出运行时错误
  outputRuntimeError?: boolean,
  //是否为宽松模式,区别在于对string的反序列化上面
  loose?: boolean,
  //文件上传配置
  files?: {
    //存储,模式为内存,详见multer模块
    storage?: any
    //最大文件大小
    maxSize?: number
    //一次最多允许多少个文件上传
    maxCount?: number
  },
  cors?: boolean | KatoCorsOptions
}

//默认配置
const defaultOptions: KatoOptions = {
  dev: false,
  loose: false,
  outputRuntimeError: true,
  files: {
    storage: null,
    maxCount: 5,
    maxSize: 50000000
  },
  cors: {
    origin: '*',
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    // some legacy browsers (IE11, various SmartTVs) choke on 204
    optionsStatusCode: 204
  }
};

export function getOptions(options: KatoOptions): KatoOptions {
  const result = mergeOptions(defaultOptions, options);

  //针对cors options的特殊处理
  if (options.cors === true)
    throw new Error("kato:cors选项只能为false或者{}(KatoCorsOptions)");
  else if (options.cors === false)
    result.cors = false;
  else
    result.cors = mergeOptions(defaultOptions.cors, options.cors);

  debug(`Kato Options:\n${prettyJson.render(result, {noColor: true})}\n`);
  return result;
}
