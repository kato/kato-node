import * as dayjs from 'dayjs';

const ISO8601Regex = /^(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]?\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]?\d:[0-5]\d|Z))$/;

export function reviver(key, value) {
  if (typeof value === 'string')
    if (ISO8601Regex.exec(value))
      return dayjs(value).toDate();
  return value;
}

export function replacer(key, value) {
  if (typeof value === 'string')
    if (ISO8601Regex.exec(value))
      return dayjs(value).format("YYYY-MM-DDTHH:mm:ss.SSSZ");
  return value;
}

export function jsonParse(text: string) {
  return JSON.parse(text, reviver);
}

export function jsonStringify(value: any) {
  return JSON.stringify(value, replacer)
}
