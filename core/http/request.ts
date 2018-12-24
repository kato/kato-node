import {IncomingMessage} from "http";

export interface KatoRequest extends IncomingMessage {
}

export function createRequest(req: IncomingMessage) {
  return Object.assign(req, {})
}
