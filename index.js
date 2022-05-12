const express = require("express");
const bodyParser = require("body-parser");
const userRoutes = require("./src/routes/user-routes");
const authRoutes = require("./src/routes/auth-routes");
require("dotenv").config();

const port = process.env.PORT;
const app = express();
app.use(bodyParser.json());

app.all("*", (req, res, next) => {
  const method = req.method;
  console.log(`Methode ${method} aangeroepen`);
  next();
});

//Alle routes beginnen met /api
app.use("/api", userRoutes);
app.use("/api", authRoutes);

app.all("*", (req, res) => {
  res.status(404).json({
    status: 404,
    result: "Endpoint not found",
  });
});

//Error handler
app.use((err, req, res, next) => {
  console.log("Error: " + err.toString());
  res.status(500).json({
    status: 500,
    message: err.toString(),
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

module.exports = app;
