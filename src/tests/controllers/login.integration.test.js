const _ = require('lodash');
const supertest = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const User = require('../../models/User');
const api = supertest(app);

describe('Login IntegrationTests', () => {
  beforeEach(async () => {
    await User.deleteMany({});
    await User.save({ username: 'test', password: 'test' });
  });

  afterAll(async () => {
    await User.deleteMany({});
    mongoose.connection.close();
  });
  test('successful login', async () => {
    const token = await User.getToken({ username: 'test', password: 'test' });

    const response = await api
      .post('/api/login')
      .send({ username: 'test', password: 'test' })
      .expect(200)
      .expect('Content-Type', /application\/json/u);

    expect(response.body.token).toBe(token);
  });

  test('failed login', async () => {
    const testUser = { username: 'test', password: 'wrongPassword' };

    await api
      .post('/api/login')
      .send(testUser)
      .expect(401);
  });
});
