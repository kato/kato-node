import {ServerResponse} from "http";
import {Stream} from "stream";
import onFinished from "on-finished";
import destroy from "destroy";

const bodySymbol = Symbol('res-body');

export interface KatoResponse extends ServerResponse {
  body: String | Buffer | Stream,
  writable: boolean
}

export function createResponse(res: ServerResponse): KatoResponse {
  return Object.assign(res, {
    set body(val: String | Buffer | Stream) {
      this[bodySymbol] = val;

      //如果是一个stream
      if (val instanceof Stream) {
        onFinished(res, destroy.bind(null, val))
      }
    },
    get body() {
      return this[bodySymbol]
    },
    get writable() {
      if (this.finished) return false;

      if (!this.socket) return true;
      return this.socket.writable;
    }
  })
}
