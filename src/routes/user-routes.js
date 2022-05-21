const express = require("express");
const router = express.Router();
const userController = require("../controllers/user-controller");
const authController = require("../controllers/auth-controller");

router.get("/", (req, res) => {
  res.status(200).json({
    status: 200,
    result: "Hello World",
  });
});

//UC-201 Register as a new user
router.post("/user", userController.validateUser, userController.addUser);

//UC-202 Get all users
router.get("/user", authController.validateToken, userController.getAllUsers);

//UC-203 Request personal user profile
router.get(
  "/user/profile",
  authController.validateToken,
  userController.getUserProfile
);

//UC-204 Get a single user by ID
router.get(
  "/user/:userId",
  authController.validateToken,
  userController.getUserById
);

//UC-205 Update a single user
router.put(
  "/user/:userId",
  authController.validateToken,
  userController.validateUser,
  userController.updateUserById
);

//UC-206 Delete a user
router.delete(
  "/user/:userId",
  authController.validateToken,
  userController.deleteUserById
);

module.exports = router;
