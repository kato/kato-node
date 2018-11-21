import {startServer} from "../env/server";
import request from 'supertest';

let server;
beforeAll(async () => server = await startServer());
afterAll(async () => server.close());

describe('其他测试', () => {
  test('非法url', async () => {
    const res = await request(server)
      .post(`${server.prefix}/asdf`)
      .send();

    let result = JSON.parse(res.text);
    expect(result._KatoErrorCode_).toBe(-1);
    expect(result.message).toBe('请求url不符合规范');
  });

  test('不存在的模块', async () => {
    const res = await request(server)
      .post(`${server.prefix}/fakeModule/fakeMethod.ac`)
      .send();

    let result = JSON.parse(res.text);
    expect(result._KatoErrorCode_).toBe(-1);
    expect(result.message).toBe('找不到对应的模块fakeModule');
  });

  test('不存在的方法', async () => {
    const res = await request(server)
      .post(`${server.prefix}/Misc/fakeMethod.ac`)
      .send();

    let result = JSON.parse(res.text);
    expect(result._KatoErrorCode_).toBe(-1);
    expect(result.message).toBe('模块Misc中找不到对应的方法fakeMethod');
  });

  test('基本调用', async () => {
    const res = await request(server)
      .post(`${server.prefix}/Misc/getData.ac`)
      .send();

    let result = JSON.parse(res.text);
    expect(result).toBe('hello world!');
  })
});




