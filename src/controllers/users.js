const usersRouter = require('express').Router();
const User = require('../models/User');

usersRouter.post('/', async (request, response, next) => {
  try {
    const body = request.body;
    const savedUser = await User.save(body);

    return response.json(savedUser);
  } catch (exception) {
    return next(exception);
  }
});

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs');

  response.json(users);
});

module.exports = usersRouter;
