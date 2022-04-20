const http = require("http");

const port = process.env.PORT || 3000;

const result = {
  code: 200,
  message: "Hello World",
};

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html");
  res.end(JSON.stringify(result));
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
