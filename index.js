const app = require("./src/app"); // the actual Express app
const http = require("http");
const config = require("./src/utils/config");

const server = http.createServer(app);

server.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
});
