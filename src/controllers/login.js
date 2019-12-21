const loginRouter = require('express').Router();
const User = require('../models/User');

loginRouter.post('/', async (request, response) => {
  const body = request.body;

  try {
    const token = await User.getToken(body);
    const user = await User.findOne({ username: body.username });

    return response
      .status(200)
      .send({ token, username: user.username, name: user.name });
  } catch (err) {
    return response.status(401).json({
      error: 'invalid username or password'
    });
  }
});

module.exports = loginRouter;
