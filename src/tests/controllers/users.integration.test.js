const supertest = require('supertest');
const mongoose = require('mongoose');
const User = require('../../models/User');
const testHelper = require('../testHelper');
const app = require('../../app');
const api = supertest(app);

describe('Users IntegrationTests', () => {
  beforeEach(async () => {
    await User.deleteMany({});

    await User.save({
      username: 'root',
      password: 'sekret'
    });

    await Promise.all(
      testHelper.initialUsers.map(initialUser => User.save(initialUser))
    );
  });

  afterAll(async () => {
    await User.deleteMany({});
    mongoose.connection.close();
  });

  describe('POST /api/users', () => {
    test('creation succeeds with a fresh username', async () => {
      const usersAtStart = await testHelper.usersInDb();

      const newUser = {
        username: 'mluukkai',
        name: 'Matti Luukkainen',
        password: 'salainen'
      };

      await api
        .post('/api/users')
        .send(newUser)
        .expect(200)
        .expect('Content-Type', /application\/json/u);

      const usersAtEnd = await testHelper.usersInDb();

      expect(usersAtEnd.length).toBe(usersAtStart.length + 1);

      const userNames = usersAtEnd.map(u => u.username);

      expect(userNames).toContain(newUser.username);
    });

    test('creation fails if username is too short', async () => {
      await api
        .post('/api/users')
        .send({ username: 'ab', password: '1234' })
        .expect(400);
    });

    test('creation fails if password not set', async () => {
      await api
        .post('/api/users')
        .send({ username: 'abcd' })
        .expect(400);
    });

    test('creation fails if password is too short', async () => {
      await api
        .post('/api/users')
        .send({ username: 'abcd', password: '12' })
        .expect(400);
    });

    test('creation fails if username is duplicated', async () => {
      await api
        .post('/api/users')
        .send({ username: 'root', password: '1245' })
        .expect(400);
    });
  });

  describe('GET /api/users', () => {
    test('get initial user names', async () => {
      const response = await api
        .get('/api/users')
        .expect(200)
        .expect('Content-Type', /application\/json/u);

      const existingUsers = await testHelper.usersInDb();

      expect(response.body).toEqual(expect.arrayContaining(existingUsers));
    });
  });
});
