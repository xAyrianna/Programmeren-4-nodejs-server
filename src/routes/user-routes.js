const express = require("express");
const router = express.Router();
const userController = require("../controllers/user-controller");

router.get("/", (req, res) => {
  res.status(200).json({
    status: 200,
    result: "Hello World",
  });
});

//UC-201
router.post("/api/user", userController.validateUser, userController.addUser);

//UC-202
router.get("/api/user", userController.getAllUsers);

//UC-203
router.get("/api/user/profile", userController.getUserProfile);

//UC-204
router.get("/api/user/:userId", userController.getUserById);

//UC-205
router.put("/api/user/:userId", userController.updateUserById);

//UC-206
router.delete("/api/user/:userId", userController.deleteUserById);

module.exports = router;
