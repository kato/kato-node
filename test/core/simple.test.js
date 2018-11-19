const {Kato, ExpressAdapter} = require('../..');
const express = require('express');
const request = require('supertest');

let app;

beforeAll(() => {
  let kato = new Kato();
  app = express();
  app.use('/api', ExpressAdapter(kato));
});

describe('simple', () => {
  test('request test', async () => {
    const res = await request(app)
      .post('/api/fakeModule/fakeMethod.ac')
      .send();

    let result = JSON.parse(res.text);
    expect(result.code).toBe(-1);
    expect(result.message).toBe('找不到对应的模块fakeModule');
  });
});


