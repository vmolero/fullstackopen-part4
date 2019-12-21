const blogsRouter = require('express').Router();
const Blog = require('../models/Blog');
const User = require('../models/User');

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user');

  response.json(blogs);
});

blogsRouter.post('/', async (request, response) => {
  try {
    const blog = new Blog(request.body);
    const user = await User.findOne({});

    blog.user = user._id;
    const savedBlog = await blog.save();

    user.blogs.push(savedBlog._id);
    await user.save();

    response.status(201).json(savedBlog);
  } catch (err) {
    response.sendStatus(400);
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
