import {Stream} from "stream";
import {KatoResponse} from "./response";


/**
 * 把KatoResponse转换成为node标准的res,并写入http流中
 * @param res
 */
export function transformer(res: KatoResponse) {
  //如果不可写,res已经被end了
  if (!res.writable) return;

  const body = res.body;

  //如果是一个字符串
  if (Buffer.isBuffer(body)) return res.end(body);
  //如果是buffer
  if (typeof body === 'string') return res.end(body);
  //如果是一个stream
  if (body instanceof Stream) return body.pipe(res);
  //否则,关闭res
  return res.end();
}

