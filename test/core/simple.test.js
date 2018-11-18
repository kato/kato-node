const {Kato, ExpressAdapter} = require('../../index');
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

    expect(JSON.parse(res.text).code).toBe(0);
  });
});


