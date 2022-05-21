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
  validateUpdateMeal: (req, res, next) => {
    let meal = req.body;
    let { name, price, maxAmountOfParticipants } = meal;

    try {
      assert(typeof name === "string", "Name must be a string.");
      assert(
        typeof maxAmountOfParticipants === "number",
        "Max amount of participants must be a number."
      );
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
      .replace("T", " ")
      .slice(0, 19);

    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;

      logger.debug("deliverydate: ", deliveryDate);

      connection.query(
        "INSERT INTO meal (name, description, isVega, isVegan,isToTakeHome, dateTime, imageUrl, allergenes, maxAmountOfParticipants, price, cookId) VALUES (?,?,?,?,?,?,?,?,?,?,?);",
        [
          meal.name,
          meal.description,
<<<<<<< HEAD
          deliveryDate,
=======
          meal.isVega,
          meal.isVegan,
          meal.isToTakeHome,
          meal.dateTime,
>>>>>>> refact-controllers
          meal.imageUrl,
          meal.allergenes,
          meal.maxAmountOfParticipants,
          meal.price,
          req.userId,
        ],
        function (error, results, fields) {
          connection.release();

          if (error) {
            logger.debug(error.sqlMessage);
            logger.debug(error);
            res.status(400).json({
              status: 400,
              message: "something went wrong " + error,
            });
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
  updateMealById: (req, res) => {
    const mealId = req.params.mealId;
    const updatedMeal = req.body;
    logger.debug("Update meal has been called");

    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;

      connection.query(
        "SELECT * FROM meal WHERE id = ?;",
        [mealId],
        function (error, results, fields) {
          logger.debug("#Results = ", results.length);

          if (error) {
            logger.debug(error.sqlMessage);
            next(error);
          }
          if (results.length > 0) {
            if (results[0].cookId == req.userId) {
              connection.query(
                "UPDATE meal SET name=?, price=?, maxAmountOfParticipants=?",
                [
                  updatedMeal.name,
                  updatedMeal.price,
                  updatedMeal.maxAmountOfParticipants,
                ],
                function (error, results, fields) {
                  // When done with the connection, release it.
                  connection.release();

                  // Handle error after the release.
                  if (error) throw error;

                  // Don't use the connection here, it has been returned to the dbconnection.
                  if (results.affectedRows > 0) {
                    res.status(200).json({
                      status: 200,
                      message: `Meal with id: ${mealId} has been updated`,
                    });
                  }
                }
              );
            } else {
              logger.debug(
                `Id's are not the same; requested meal from cookID: ${results[0].cookId} and logged-in user: ${req.userId}`
              );
              res.status(403).json({
                status: 403,
                message: "You can only update your own meals",
              });
            }
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
  deleteMealById: (req, res) => {
    const mealId = req.params.mealId;
    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;

      connection.query(
        "SELECT * FROM meal WHERE id = ?;",
        [mealId],
        function (error, results, fields) {
          logger.debug("#Results = ", results.length);

          if (error) {
            logger.debug(error.sqlMessage);
            next(error);
          }
          if (results.length > 0) {
            if (results[0].cookId == req.userId) {
              connection.query(
                "DELETE FROM meal WHERE id = ?;",
                [mealId],
                function (error, results, fields) {
                  connection.release;
                  res.status(200).json({
                    status: 200,
                    message: "Meal has been deleted succesfully",
                  });
                }
              );
            } else {
              logger.debug(
                `Id's are not the same; requested meal from cookID: ${results[0].cookId} and logged-in user: ${req.userId}`
              );
              res.status(403).json({
                status: 403,
                message: "You can only delete your own meals",
              });
            }
          } else {
            res.status(404).json({
              status: 404,
              message: `Could not find meal with id: ${mealId}.`,
            });
          }
        }
      );
    });
    // if (mealId != req.userId) {
    //   logger.debug(
    //     `Id's are not the same; requested: ${id} and logged-in user: ${req.userId}`
    //   );
    //   res.status(403).json({
    //     status: 403,
    //     message: "You can only delete your own meals",
    //   });
    // } else {
    // }
  },
};

module.exports = controller;
