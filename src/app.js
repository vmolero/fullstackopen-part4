const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');

const config = require('./utils/config');
const loginRouter = require('./controllers/login');
const usersRouter = require('./controllers/users');
const blogsRouter = require('./controllers/blogs');
const middleware = require('./utils/middleware');
const app = express();

function isEmptyObject(obj) {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
}

mongoose.connect(config.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.use(cors());
app.use(express.static('build'));
app.use(bodyParser.json());
if (config.NODE_ENV !== 'test') {
  morgan.token('morganBody', function(req) {
    if ('body' in req && !isEmptyObject(req.body)) {
      return JSON.stringify(req.body);
    }
    return ' ';
  });
  app.use(
    morgan(
      ':method :url :status :res[content-length] - :response-time ms :morganBody'
    )
  );
}

app.use(middleware.tokenExtractor);
app.use('/api/login', loginRouter);
app.use('/api/users', usersRouter);
app.use('/api/blogs', blogsRouter);

if (config.NODE_ENV === 'test') {
  /* eslint global-require: "off" */
  const testingRouter = require('./controllers/testing');

  app.use('/api/testing', testingRouter);
}

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
