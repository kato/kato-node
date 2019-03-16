import Context from "../context";
import {Middleware} from "../middleware";
import * as joi from 'joi';
import {Schema, SchemaLike} from "joi";
import {KatoError} from "../error";

//参数验证异常
export class KatoValidateError extends KatoError {
  constructor(message: string = "非法的API参数调用") {
    super(message, -3);
    this.name = 'KatoValidateError';
  }
}

const validateSymbol = Symbol('kato-validate');

//参数验证中间件
export default async function paramValidate(ctx: Context, next: Middleware) {
  //拿到所有的参数,并且挨个验证
  const validate: Schema[] = ctx.method.method[validateSymbol];
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
          throw new KatoValidateError(result.error.message)
        }
      })
  }

  await next();
}

//validate注解
export function validate(...schemas: SchemaLike[]) {
  return function (target, key) {
    if (key && typeof target[key] === 'function') {
      target[key][validateSymbol] = schemas.map(it => {
        if (it !== null && it !== undefined && !it['isJoi']) {
          return joi.compile(it);
        }

        return it;
      });
    } else {
      throw new Error('kato:validate只能作用于方法上')
    }
  }
}

export const should = joi;
