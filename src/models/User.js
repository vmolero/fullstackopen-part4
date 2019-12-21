const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../utils/config');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    uniqueCaseInsensitive: true,
    minlength: 3
  },
  name: String,
  passwordHash: String,
  blogs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog'
    }
  ]
});

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    // The passwordHash should not be revealed
    delete returnedObject.passwordHash;
  }
});
userSchema.plugin(uniqueValidator);
const User = mongoose.model('User', userSchema);

function validatePassword(body) {
  if (!('password' in body)) {
    throw new Error('ValidationError: password is required');
  }
  if (body.password.length < 3) {
    throw new Error('ValidationError: password too short (min 3 chars.)');
  }
}

const insert = async body => {
  validatePassword(body);

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(body.password, saltRounds);

  const user = new User({
    username: body.username,
    name: body.name,
    passwordHash,
    blogs: []
  });

  return user.save();
};

const findById = id => User.findById(id);
const find = criteria => User.find(criteria);
const findOne = criteria => User.findOne(criteria);
const create = body => new User(body);
const deleteMany = criteria => User.deleteMany(criteria);

const getToken = async credentials => {
  const user = await User.findOne({ username: credentials.username });
  const passwordCorrect =
    user === null
      ? false
      : await bcrypt.compare(credentials.password, user.passwordHash);

  if (!(user && passwordCorrect)) {
    throw new Error('invalid user or password');
  }

  const userForToken = {
    username: user.username,
    id: user._id
  };

  const token = jwt.sign(userForToken, config.SECRET);

  return token;
};

module.exports = {
  insert,
  findById,
  find,
  getToken,
  findOne,
  create,
  deleteMany
};
