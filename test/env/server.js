import {Kato} from "../..";
import {Misc} from "./api/misc";

export async function startServer() {
  let kato = new Kato({outputRuntimeError: false});
  kato.load(Misc);
  await kato.listen(0);
  kato.server.prefix = "";
  return kato.server;
}
