import {Request, Response} from "express";

import Kato from "../core/kato";
import Context from "../core/context";

//express框架适配器
export function adapter(kato: Kato) {
  return async function (req: Request, res: Response) {
    await kato.do(new Context(req, res))
  }
}
