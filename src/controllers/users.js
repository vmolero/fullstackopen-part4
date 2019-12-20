const bcrypt = require("bcrypt");
const usersRouter = require("express").Router();
const User = require("../models/User");

function validatePassword(body) {
  if (!("password" in body)) {
    throw new Error("ValidationError: password is required");
  }
  if (body.password.length < 3) {
    throw new Error("ValidationError: password too short (min 3 chars.)");
  }
}

usersRouter.post("/", async (request, response, next) => {
  try {
    const body = request.body;

    validatePassword(body);

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(body.password, saltRounds);

    const user = new User({
      username: body.username,
      name: body.name,
      passwordHash
    });

    const savedUser = await user.save();

    return response.json(savedUser);
  } catch (exception) {
    return next(exception);
  }
});

usersRouter.get("/", async (request, response) => {
  const users = await User.find({});

  response.json(users);
});

module.exports = usersRouter;
