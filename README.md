fullstackopen-part4

# Backend project

## 1. Set up the project

    `$ npm init`

## 2. Install minimum dependencies:

    `$ npm i express body-parser cors mongoose dotenv`

## 3. Create `.env` file

`.env`

```
PORT=3000
DB_CONNECTION_STRING=mydb://user:pass@localhost:1234
```

4.  Create index.js file:

`index.js`

```javascript
const app = require("./src/app"); // the actual Express app
const http = require("http");
const config = require("./utils/config");

const server = http.createServer(app);

server.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
});
```

5.  Actual Express app.js file in `src` folder:

`src/app.js` (could be also <_app_name_>.js)

```javascript
const config = require("./utils/config");

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");
const notesRouter = require("./controllers/notes");
const middleware = require("./utils/middleware");
const mongoose = require("mongoose");

console.log("connecting to", config.MONGODB_URI);

// Or other DB driver
mongoose
  .connect(config.MONGODB_URI, { useNewUrlParser: true })
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch(error => {
    console.log("error connection to MongoDB:", error.message);
  });

app.use(cors());
app.use(express.static("build"));
app.use(bodyParser.json());
app.use(middleware.requestLogger);

app.use("/api/<resource>", notesRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
```

6. Install dev dependency for server watching:

```
$ npm i -D nodemon
```

7. Add npm run scripts to `package.json` file

```json
[...]
"scripts": {
    [...]
    "start": "node index.js",
    "watch": "nodemon index.js"
  },
[...]
```

so, in order to run the project you run

```bash
$ npm start
```

in order to watch during development

```bash
$ npm run watch
```

## 8. for middleware: requestLogger u can use morgan

```
$ npm i morgan
```

```javascript
const morgan = require("morgan");

function isEmptyObject(obj) {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
}
morgan.token("morganBody", function(req) {
  if ("body" in req && !isEmptyObject(req.body)) {
    return JSON.stringify(req.body);
  }
  return " ";
});

app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :morganBody"
  )
);
```
