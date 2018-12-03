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
  }
}

//默认配置
export const defaultOptions: KatoOptions = {
  dev: false,
  loose: false,
  outputRuntimeError: true,
  files: {
    storage: null,
    maxCount: 5,
    maxSize: 50000000
  }
};
