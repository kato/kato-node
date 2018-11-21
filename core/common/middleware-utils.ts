import {NextHandleFunction} from "connect";
import {IncomingMessage, ServerResponse} from "http";

export function middlewareWrapper(nativeMiddleware: NextHandleFunction) {
  return async function (req: IncomingMessage, res: ServerResponse) {
    return new Promise((resolve, reject) => {
      nativeMiddleware(req, res, function (err) {
        if (err)
          reject(err);
        else
          resolve();
      })
    })
  }
}
