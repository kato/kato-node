import {IncomingMessage, ServerResponse} from "http";

export default class Context {
  public result: any;
  public error: any;
  public moduleName: string;
  public methodName: string;
  public module: any;
  public method: any;
  public parameters = {};

  constructor(public req: IncomingMessage, public res: ServerResponse) {
  }
}
