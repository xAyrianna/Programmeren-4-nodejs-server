const assert = require("assert");
const dbconnection = require("../../database/dbconnection");
const logger = require("../config/config").logger;

let controller = {
  validateMeal: (req, res, next) => {
    let meal = req.body;
    let { name, description, dateTime, imageUrl, price } = meal;

    try {
      assert(typeof name === "string", "Name must be a string.");
      assert(typeof description === "string", "Description must be a string.");
      assert(typeof dateTime === "string", "DateTime must be a string.");
      assert(typeof imageUrl === "string", "Imageurl must be a string.");
      assert(typeof price === "string", "Price must be a number.");
      next();
    } catch (err) {
      const error = {
        status: 400,
        message: err.message,
      };
      next(error);
    }
  },
  addMeal: (req, res, next) => {
    let meal = req.body;
    let deliveryDate = new Date(meal.dateTime)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;

      connection.query(
        "INSERT INTO meal (name, description, dateTime, imageUrl, price, cookId) VALUES (?,?,?,?,?,?);",
        [
          meal.name,
          meal.description,
          deliveryDate,
          meal.imageUrl,
          meal.price,
          req.userId,
        ],
        function (error, results, fields) {
          connection.release();

          if (error) {
            logger.debug(error.sqlMessage);
            next(error);
          }
          res.status(201).json({
            status: 201,
            message: "Meal has been succesfully added",
          });
        }
      );
    });
  },
  getAllMeals: (req, res) => {
    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;

      connection.query(
        "SELECT * FROM meal;",
        function (error, results, fields) {
          connection.release();

          if (error) {
            logger.debug(error.sqlMessage);
            next(error);
          }
          res.status(200).json({
            status: 200,
            result: results,
          });
        }
      );
    });
  },
  getMealbyId: (req, res) => {
    const mealId = req.params.mealId;

    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;

      connection.query(
        "SELECT * FROM meal WHERE id = ?;",
        [mealId],
        function (error, results, fields) {
          connection.release();
          logger.debug("#Results = ", results.length);

          if (error) {
            logger.debug(error.sqlMessage);
            next(error);
          }
          if (results.length > 0) {
            res.status(200).json({
              status: 200,
              result: results,
            });
          } else {
            res.status(404).json({
              status: 404,
              message: `Could not find meal with id: ${mealId}.`,
            });
          }
        }
      );
    });
  },
  updateMealById: (req, res) => {},
  deleteMealById: (req, res) => {},
};

module.exports = controller;
