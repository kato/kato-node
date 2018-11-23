import Context from "../context";
import {Middleware} from "../middleware";
import * as joi from 'joi';
import {JoiObject} from "joi";
import {KatoRuntimeError} from "../error";

const debug = require('debug')('kato:middle:validate');

//参数验证中间件
export default async function paramValidate(ctx: Context, next: Middleware) {
  //拿到所有的参数,并且挨个验证
  const validate = ctx.method.method.__validate;
  if (validate instanceof Array) {
    ctx.method.parameters
      .map((p, index) => ({
        name: p.name,
        value: ctx.parameters[p.name],
        schema: validate[index]
      }))
      .filter(it => it.schema)
      .forEach(it => {
        const result = joi.validate(it.value, it.schema.label(it.name), {convert: false});
        if (result.error) {
          throw new KatoRuntimeError(`${ctx.module.name}.${ctx.method.name} => ${result.error.message}`)
        }
      })
  }

  await next();
}

//validate注解
export function validate(...schemas: JoiObject[]) {
  return function (target, key) {
    if (key && typeof target[key] === 'function') {
      target[key].__validate = schemas;
    } else {
      throw new Error('kato:validate只能作用于方法上')
    }
  }
}

export const should = joi;