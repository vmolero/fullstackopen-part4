const _ = require('lodash');
const supertest = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const Blog = require('../../models/Blog');
const User = require('../../models/User');
const testHelper = require('../testHelper');
const api = supertest(app);

describe('Blog routes IntegrationTests', () => {
  let token = null;

  beforeAll(async () => {
    await Blog.deleteMany({});
    await User.deleteMany({});
  });

  beforeEach(async () => {
    const testUser = { username: 'test', password: 'test' };

    await User.insert(testUser);
    token = await User.getToken({ username: 'test', password: 'test' });
    await Promise.all(
      testHelper.initialBlogEntries.map(entry => {
        const blogObject = new Blog(entry);

        return blogObject.save();
      })
    );
  });

  afterEach(async () => {
    await Blog.deleteMany({});
    await User.deleteMany({});
  });

  afterAll(() => {
    mongoose.connection.close();
    token = null;
  });

  describe('GET /api/blogs', () => {
    test('when the database is empty', async () => {
      await Blog.deleteMany({});
      const result = await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/u);

      expect(result.body).toEqual([]);
    });

    test('when database contains data', async () => {
      const result = await api.get('/api/blogs');

      expect(result.body.length).toBe(6);
    });

    test('that blog entries are correct', async () => {
      const result = await api.get('/api/blogs');

      result.body.forEach(blog => {
        const entry = _.omit(blog, ['id']);

        expect(testHelper.initialBlogEntries).toContainEqual(entry);
      });
    });

    test('4.9*: Blog list tests, step2 (there is an id attribute)', async () => {
      const result = await api.get('/api/blogs');

      expect(result.body[0].id).toBeDefined();
    });
  });

  describe('POST /api/blogs', () => {
    test('should not allow to post blog if no token', async () => {
      const newEntry = {
        title: 'I love lego train',
        author: 'Daniel Molero',
        url: 'http://daniel-molero.com/blog/',
        likes: 7
      };

      await api
        .post('/api/blogs')
        .send(newEntry)
        .expect(401);
    });

    test('should not allow to post blog if wrong token', async () => {
      const newEntry = {
        title: 'I love lego train',
        author: 'Daniel Molero',
        url: 'http://daniel-molero.com/blog/',
        likes: 7
      };

      await api
        .post('/api/blogs')
        .set('Authorization', 'Bearer wrongToken')
        .send(newEntry)
        .expect(401);
    });
    test('4.10: Blog list tests, step3: a new blog entry is created', async () => {
      const newEntry = {
        title: 'I love lego train',
        author: 'Daniel Molero',
        url: 'http://daniel-molero.com/blog/',
        likes: 7
      };
      const blogsInitialLength = (await Blog.find({})).length;

      const result = await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newEntry)
        .expect(201)
        .expect('Content-Type', /application\/json/u);

      expect(result.body.id).toBeDefined();
      const blog = (await Blog.findById(result.body.id)).toJSON();

      expect(_.omit(blog, ['id', 'user'])).toEqual(newEntry);
      const blogsFinalLength = (await Blog.find({})).length;

      expect(blogsFinalLength).toBe(blogsInitialLength + 1);
    });

    test('4.11*: Blog list tests, step4: likes defaults to 0 if missing', async () => {
      const newEntry = {
        title: 'I love lego train',
        author: 'Daniel Molero',
        url: 'http://daniel-molero.com/blog/'
      };

      const result = await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newEntry);
      const blog = (await Blog.findById(result.body.id)).toJSON();

      expect(blog.likes).toBe(0);
    });

    describe('4.12*: Blog list tests, step5', () => {
      test('when title is missing it should return 400', async () => {
        const newEntry = {
          author: 'Daniel Molero',
          url: 'http://daniel-molero.com/blog/',
          likes: 1
        };

        await api
          .post('/api/blogs')
          .set('Authorization', `Bearer ${token}`)
          .send(newEntry)
          .expect(400);
      });

      test('when url is missing it should return 400', async () => {
        const newEntry = {
          title: 'I love lego train',
          author: 'Daniel Molero',
          likes: 1
        };

        await api
          .post('/api/blogs')
          .set('Authorization', `Bearer ${token}`)
          .send(newEntry)
          .expect(400);
      });

      test('when both title and url are missing it should return 400', async () => {
        const newEntry = {
          author: 'Daniel Molero',
          likes: 1
        };

        await api
          .post('/api/blogs')
          .set('Authorization', `Bearer ${token}`)
          .send(newEntry)
          .expect(400);
      });
    });
  });

  describe('DELETE /api/blogs/:id', () => {
    test('4.13 Blog list expansions, step1 (added token auth)', async () => {
      const newEntry = new Blog({
        title: 'I love lego train',
        author: 'Daniel Molero',
        url: 'http://daniel-molero.com/blog/'
      });

      const newUser = await User.insert({
        username: 'victor',
        password: '1234'
      });
      const userToken = await User.getToken({
        username: 'victor',
        password: '1234'
      });

      newEntry.user = newUser._id;
      const savedBlog = await newEntry.save();

      await api
        .delete(`/api/blogs/${savedBlog.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(204);
      const deletedBlog = await Blog.findById(savedBlog.id);

      expect(Boolean(deletedBlog)).toBe(false);
    });

    test('disallow deleting if user is not who posted', async done => {
      const newEntry = new Blog({
        title: 'I love lego train',
        author: 'Daniel Molero',
        url: 'http://daniel-molero.com/blog/'
      });
      const victor = await User.insert({
        username: 'victor',
        password: '1234'
      });

      await User.insert({ username: 'david', password: '1111' });
      const davidToken = await User.getToken({
        username: 'david',
        password: '1111'
      });

      newEntry.user = victor._id;
      const savedBlog = await newEntry.save();

      await api
        .delete(`/api/blogs/${savedBlog.id}`)
        .set('Authorization', `Bearer ${davidToken}`)
        .expect(401);
      const stillExistingBlog = await Blog.findById(savedBlog.id);

      expect(Boolean(stillExistingBlog)).toBe(true);
      done();
    });
  });

  describe('PUT /api/blogs/:id', () => {
    test('4.14 Blog list expansions, step2', async () => {
      const blogList = await Blog.find({});
      const firstEntry = blogList.shift().toJSON();

      firstEntry.author = 'Alba Molero';

      await api
        .put(`/api/blogs/${firstEntry.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(firstEntry)
        .expect(200);
      const updatedBlogEntry = await Blog.findById(firstEntry.id);

      expect(updatedBlogEntry.author).toBe('Alba Molero');
    });
  });
});
