const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth-controller");
const mealController = require("../controllers/meal-controller");

//UC-301 Register a meal
router.post(
  "/meal",
  authController.validateToken,
  mealController.validateMeal,
  mealController.addMeal
);

//UC-302 Update a single meal
router.put(
  "/meal/:mealId",
  authController.validateToken,
  mealController.validateUpdateMeal,
  mealController.updateMealById
);

//UC-303 Get List of meals
router.get("/meal", mealController.getAllMeals);

//UC-304 Get a single meal by id
router.get("/meal/:mealId", mealController.getMealbyId);

//UC-305 Delete a meal
router.delete(
  "/meal/:mealId",
  authController.validateToken,
  mealController.deleteMealById
);

module.exports = router;
