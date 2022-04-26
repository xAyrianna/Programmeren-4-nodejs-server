const express = require("express");
const router = express.Router();

let database = [];
let id = 0;

router.get("/", (req, res) => {
  res.status(200).json({
    status: 200,
    result: "Hello World",
  });
});

//UC-201
router.post("/api/user", (req, res) => {
  let user = req.body;
  let userEmail = database.filter(
    (item) => item.emailAdress == user.emailAdress
  );

  if (userEmail.length > 0) {
    res.status(404).json({
      status: 404,
      result: `Email already exists.`,
    });
  } else {
    console.log(user);
    id++;
    user = {
      id,
      ...user,
    };

    database.push(user);
    console.log(database);
    res.status(201).json({
      status: 201,
      result: database,
    });
  }
});

//UC-202
router.get("/api/user", (req, res) => {
  res.status(200).json({
    status: 200,
    result: database,
  });
});

//UC-203
router.get("/api/user/profile", (req, res) => {
  res.status(404).json({
    status: 404,
    result: "This endpoint hasn't been defined yet.",
  });
});

//UC-204
router.get("/api/user/:userId", (req, res) => {
  const userId = req.params.userId;
  let user = database.filter((item) => item.id == userId);
  if (user.length > 0) {
    console.log(user);
    res.status(200).json({
      status: 200,
      result: user,
    });
  } else {
    res.status(404).json({
      status: 404,
      result: `User with ID ${userId} not found`,
    });
  }
});

//UC-205
router.put("/api/user/:userId", (req, res) => {
  let id = req.params.userId;
  let updatedUser = req.body;
  let user = database.filter((item) => item.id == id);

  updatedUser = {
    id,
    ...updatedUser,
  };

  if (user.length > 0) {
    console.log(updatedUser);
    database[id - 1] = updatedUser;
    // console.log(database);

    res.status(200).json({
      status: 200,
      result: `Updated user with userId: ${id}`,
    });
  } else {
    res.status(404).json({
      status: 404,
      result: `Could not find user with userId: ${id}`,
    });
  }
});

//UC-206
router.delete("/api/user/:userId", (req, res) => {
  let userId = req.params.userId;
  let user = database.filter((item) => item.id == userId);

  if (userId > 0) {
    database.splice(userId - 1);
    console.log(database);
    res.status(200).json({
      status: 200,
      result: `Deleted user with userId: ${userId}`,
    });
  } else {
    res.status(404).json({
      status: 404,
      result: `Could not find user with userId: ${userId}`,
    });
  }
});

module.exports = router;
