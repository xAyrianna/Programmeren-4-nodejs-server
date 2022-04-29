const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require("body-parser");
const userRouter = require("./src/routes/user-routes");

app.use(bodyParser.json());

app.all("*", (req, res, next) => {
  const method = req.method;
  console.log(`Methode ${method} aangeroepen`);
  next();
});

//Routes for usecase 2; user
app.use("/api/", userRouter);

app.all("*", (req, res) => {
  res.status(404).json({
    status: 404,
    result: "Endpoint not found",
  });
});

//Error handler
app.use((err, req, res, next) => {
  res.status(err.status).json(err);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

module.exports = app;
