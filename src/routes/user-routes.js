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
router.post("/user", userController.validateUser, userController.addUser);

//UC-202
router.get("/user", userController.getAllUsers);

//UC-203
router.get("/user/profile", userController.getUserProfile);

//UC-204
router.get("/user/:userId", userController.getUserById);

//UC-205
router.put("/user/:userId", userController.updateUserById);

//UC-206
router.delete("/user/:userId", userController.deleteUserById);

module.exports = router;
