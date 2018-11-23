import Context from "../context";
import {Middleware} from "../middleware";
import {KatoRuntimeError} from "../error";

const debug = require('debug')('kato:middle:auth');

//验证中间件,用于验证是否有调用权限
export default async function authenticate(ctx: Context, next: Middleware) {
  const authFuncs = ctx.method.method.__authFuncs;
  if (authFuncs instanceof Array) {
    //并行地执行验证函数
    const promises = authFuncs.map(func => {
      const promise = func(ctx);
      if (promise.then) {
        return promise;
      } else {
        //如果不是一个promise,将结果转换为一个promise
        return Promise.resolve(promise)
      }
    });

    const authResults = await Promise.all(promises);
    for (const result of authResults) {
      if (!result) {
        throw new KatoRuntimeError(`不具备调用${ctx.module.name}.${ctx.method.name}的权限`)
      }
    }
  }

  await next();
}

//定义验证函数
export type AuthFunction = (ctx: Context) => Promise<boolean> | boolean

//auth注解
export function auth(...authFuncs: AuthFunction[]) {
  return function (target, key) {
    if (key && typeof target[key] === 'function') {
      target[key].__authFuncs = authFuncs;
    } else {
      throw new Error('kato:auth只能作用于方法上')
    }
  }
}

export function not(authFunc: AuthFunction): AuthFunction {
  return async function (ctx: Context) {
    if (typeof authFunc === 'function')
      return !(await authFunc(ctx));
    else
      return false;
  }
}

export function or(...authFuncs: AuthFunction[]): AuthFunction {
  return async function (ctx: Context) {
    //并行地执行验证函数
    const promises = authFuncs.map(func => {
      const promise = func(ctx) as any;
      if (promise.then) {
        return promise;
      } else {
        //如果不是一个promise,将结果转换为一个promise
        return Promise.resolve(promise)
      }
    });
    const authResults = await Promise.all(promises);
    for (const result of authResults) {
      if (result) {
        return true
      }
    }
    return false;
  };
}

export function and(...authFuncs: AuthFunction[]): AuthFunction {
  return async function (ctx: Context) {
    //并行地执行验证函数
    const promises = authFuncs.map(func => {
      const promise = func(ctx) as any;
      if (promise.then) {
        return promise;
      } else {
        //如果不是一个promise,将结果转换为一个promise
        return Promise.resolve(promise)
      }
    });
    const authResults = await Promise.all(promises);
    for (const result of authResults) {
      if (!result) {
        return false
      }
    }
    return true;
  };
}
