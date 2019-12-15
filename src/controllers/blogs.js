const blogsRouter = require("express").Router();
const Blog = require("../models/Blog");

blogsRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({});

  response.json(blogs);
});

blogsRouter.post("/", async (request, response) => {
  try {
    const blog = new Blog(request.body);
    const savedBlog = await blog.save();

    response.status(201).json(savedBlog);
  } catch (err) {
    response.sendStatus(400);
  }
});

module.exports = blogsRouter;
