import {Context, Kato} from "../core";
import {Request, Response} from "express";

//express框架适配器
export function adapter(kato: Kato) {
  return async function (req: Request, res: Response) {
    await kato.do(new Context(req, res))
  }
}
