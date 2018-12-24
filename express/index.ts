import {Request, Response} from "express";

import Kato from "../core/kato";

//express框架适配器
export function adapter(kato: Kato) {
  return async function (req: Request, res: Response) {
    await kato.do(req, res)
  }
}
