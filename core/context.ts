import {IncomingMessage, ServerResponse} from "http";
import {ModuleDescriptor, MethodDescriptor} from "./module";
import Kato from "./kato";

export default class Context {
  public result: any;
  public module: ModuleDescriptor;
  public method: MethodDescriptor;
  public parameters: any = {};
  public kato: Kato;

  constructor(public req: IncomingMessage, public res: ServerResponse) {
  }
}
