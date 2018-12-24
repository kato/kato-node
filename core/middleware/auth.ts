import Context from "../context";
import {Middleware} from "../middleware";
import {KatoRuntimeError} from "../error";

const debug = require('debug')('kato:middle:auth');

const authFuncsSymbol = Symbol('kato-auth-functions');

//验证中间件,用于验证是否有调用权限
export default async function authenticate(ctx: Context, next: Middleware) {
  const authFuncs = ctx.method.method[authFuncsSymbol];
  if (authFuncs instanceof Array) {
    //将验证函数变成为or组合
    const combinedAuth = or(...authFuncs);
    if (!(await combinedAuth(ctx)))
      throw new KatoRuntimeError(`不具备调用${ctx.module.name}.${ctx.method.name}的权限`)
  }

  await next();
}

//定义验证函数
export type AuthFunction = (ctx: Context) => Promise<boolean> | boolean

//auth注解
export function auth(...authFuncs: AuthFunction[]) {
  return function (target, key) {
    if (key && typeof target[key] === 'function') {
      target[key][authFuncsSymbol] = authFuncs;
    } else {
      throw new Error('kato:auth只能作用于方法上')
    }
  }
}

//产生一个新的验证函数,新验证函数的返回值与原验证函数相反
export function not(authFunc: AuthFunction): AuthFunction {
  return async function (ctx: Context) {
    if (typeof authFunc === 'function')
      return !(await authFunc(ctx));
    else
      return true;
  }
}

//产生一个新的验证函数,将原验证函数返回值做or运算
export function or(...authFuncs: AuthFunction[]): AuthFunction {
  return function (ctx: Context) {
    if (authFuncs.length < 1)
      return true;

    return new Promise((resolve, reject) => {
      //并行地执行验证函数,并拿到结果
      const results = authFuncs.map(func => {
        const result = func(ctx) as any || false;
        //将返回值promise化
        return result.then ? result : Promise.resolve(result);
      });

      //已经完成的promise计数
      let completed = 0;
      //轮番判断所有的结果
      for (const result of results) {
        result.then(r => {
          completed++;
          if (r)
          //如果返回结果是true,因为这是or组合,所以也无需等待其他的返回结果,直接resolve大的Promise
            resolve(true);
          else if (completed === results.length)
          //如果返回结果是false,且自己是最后一个了,直接返回false
            resolve(false);
        }).catch(err => {
          completed++;
          //如果有错误,无需等待其他,直接可以reject大的Promise
          reject(err);
        });
      }
    })
  }
}

//产生一个新的验证函数,将原验证函数返回值做and运算
export function and(...authFuncs: AuthFunction[]): AuthFunction {
  return function (ctx: Context) {
    if (authFuncs.length < 1)
      return true;

    return new Promise((resolve, reject) => {
      //并行地执行验证函数,并拿到结果
      const results = authFuncs.map(func => {
        const result = func(ctx) as any || false;
        //将返回值promise化
        return result.then ? result : Promise.resolve(result);
      });

      //已经完成的promise计数
      let completed = 0;
      //轮番判断所有的结果
      for (const result of results) {
        result.then(r => {
          completed++;
          //如果返回结果是false,因为这是and组合,所以也无需等待其他的返回结果,直接resolve大的Promise
          if (!r)
            resolve(false);
          else if (completed === results.length)
          //如果返回结果是true,且自己是最后一个了,直接返回true
            resolve(true);
        }).catch(err => {
          completed++;
          //如果有错误,无需等待其他,直接可以reject大的Promise
          reject(err);
        });
      }
    })
  }
}
