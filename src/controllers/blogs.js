const blogsRouter = require('express').Router();
const Blog = require('../models/Blog');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const config = require('../utils/config');

const getTokenFrom = request => {
  const authorization = request.get('authorization');

  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7);
  }
  return null;
};

const isValidToken = request => {
  const token = getTokenFrom(request);
  const decodedToken = jwt.verify(token, config.SECRET);

  return !token || !decodedToken.id;
};

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user');

  response.json(blogs);
});

const saveBlog = async request => {
  const blog = new Blog(request.body);
  const user = await User.findOne({});

  blog.user = user._id;
  const savedBlog = await blog.save();

  user.blogs.push(savedBlog._id);
  await user.save();

  return savedBlog;
};

blogsRouter.post('/', async (request, response, next) => {
  try {
    if (isValidToken(request)) {
      return response.status(401).json({ error: 'token missing or invalid' });
    }
    const savedBlog = await saveBlog(request);

    return response.status(201).json(savedBlog);
  } catch (err) {
    return next(err);
  }
});

blogsRouter.put('/:id', async (request, response, next) => {
  const body = request.body;

  try {
    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, body, {
      new: true,
      runValidators: true
    });

    response.json(updatedBlog.toJSON());
  } catch (err) {
    return next(err);
  }
});

blogsRouter.delete('/:id', async (request, response) => {
  try {
    await Blog.findByIdAndRemove(request.params.id);

    response.status(204).end();
  } catch (err) {
    response.sendStatus(404);
  }
});

module.exports = blogsRouter;
