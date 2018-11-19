//导出各种东东
//中间件模块中的
export {default as InitMiddleware} from './core/middleware/init'
export {default as TryCatchMiddleware} from './core/middleware/trycatch'
export {default as StubMiddleware} from './core/middleware/stub'
export {default as InvokerMiddleware} from './core/middleware/invoker'
export {default as EndMiddleware} from './core/middleware/end'

//core模块中的
export {default as Kato} from './core/kato'
export {default as Context} from './core/context'
export {default as KatoError} from './core/error'
export {alias} from './core/module'

//express适配器
export {adapter as ExpressAdapter} from './express'
