const blogsRouter = require('express').Router();
const Blog = require('../models/Blog');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const config = require('../utils/config');

const isValidToken = request => {
  if (!('token' in request)) {
    return false;
  }
  const decodedToken = jwt.verify(request.token, config.SECRET);

  return 'id' in decodedToken ? decodedToken : false;
};

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user');

  response.json(blogs);
});

const saveBlogFor = async (userId, request) => {
  const blog = new Blog(request.body);
  const user = await User.findById(userId);

  blog.user = user._id;
  const savedBlog = await blog.save();

  user.blogs.push(savedBlog._id);
  await user.save();

  return savedBlog;
};

blogsRouter.post('/', async (request, response, next) => {
  try {
    const identifiedUser = isValidToken(request);

    if (!identifiedUser) {
      return response.status(401).json({ error: 'token missing or invalid' });
    }
    const blog = await saveBlogFor(identifiedUser.id, request);
    const savedBlog = await Blog.findById(blog.id).populate('user');

    return response.status(201).json(savedBlog);
  } catch (err) {
    return next(err);
  }
});

function hasUserAssigned(blog) {
  return 'user' in blog && blog.user && 'id' in blog.user && blog.user.id;
}

blogsRouter.put('/:id', async (request, response, next) => {
  const body = request.body;

  try {
    if (hasUserAssigned(body)) {
      const userId = body.user.id;

      delete body.user;
      body.user = userId;
    }
    await Blog.findByIdAndUpdate(request.params.id, body, {
      new: true,
      runValidators: true
    });

    const updatedBlog = await Blog.findById(request.params.id).populate('user');

    response.json(updatedBlog);
  } catch (err) {
    return next(err);
  }
});

blogsRouter.delete('/:id', async (request, response) => {
  try {
    const identifiedUser = isValidToken(request);

    if (!identifiedUser) {
      return response.status(401).json({ error: 'token missing or invalid' });
    }
    const blogToDelete = await Blog.findById(request.params.id).populate(
      'user'
    );

    if (
      !hasUserAssigned(blogToDelete) ||
      blogToDelete.user.id === identifiedUser.id
    ) {
      await blogToDelete.remove();
      return response.status(204).end();
    }
    return response.status(401).end();
  } catch (err) {
    return response.sendStatus(404);
  }
});

module.exports = blogsRouter;
