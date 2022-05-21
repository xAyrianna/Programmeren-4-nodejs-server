const assert = require("assert");
const dbconnection = require("../../database/dbconnection");
const logger = require("../config/config").logger;

let controller = {
  validateUser: (req, res, next) => {
    let user = req.body;
    let { firstName, lastName, emailAdress, password } = user;

    try {
      assert(typeof firstName === "string", "Firstname must be a string");
      assert(typeof lastName === "string", "Lastname must be a string");
      assert(typeof emailAdress === "string", "EmailAddress must be a string");
      assert(typeof password === "string", "Password must be a string");
      next();
    } catch (err) {
      const error = {
        status: 400,
        message: err.message,
      };

      next(error);
    }
  },
  addUser: (req, res) => {
    let user = req.body;

    dbconnection.getConnection(function (err, connection) {
      if (err) throw err; // not connected!

      // Use the connection
      connection.query(
        "INSERT INTO user (firstName, lastName, emailAdress, password, phoneNumber, street, city) VALUES(?,?,?,?,?,?,?);",
        [
          user.firstName,
          user.lastName,
          user.emailAdress,
          user.password,
          user.phoneNumber,
          user.street,
          user.city,
        ],
        function (error, results, fields) {
          // When done with the connection, release it.
          connection.release();

          // Handle error after the release.

          if (error) {
            logger.debug(error.sqlMessage);
            res.status(409).json({
              status: 409,
              message: `User with emailaddress: ${user.emailAdress} already exists.`,
            });
          } else {
            res.status(201).json({
              status: 201,
              message: "User has been added",
            });
          }
        }
      );
    });
  },
  getAllUsers: (req, res, next) => {
    const { firstName, isActive } = req.query;
    logger.debug(`name = ${firstName} isActive = ${isActive}`);

    let queryString = "SELECT * FROM `user`";

    if (firstName || isActive) {
      queryString += " WHERE ";
      if (firstName) {
        queryString += `firstName LIKE '%${firstName}%'`;
      }
      if (firstName && isActive) {
        queryString += " AND ";
      }
      if (isActive) {
        queryString += `isActive='${isActive}'`;
      }
    }
    logger.debug(queryString);

    dbconnection.getConnection(function (err, connection) {
      if (err) {
        next(err);
      } // not connected!

      // Use the connection
      connection.query(queryString, function (error, results, fields) {
        // When done with the connection, release it.
        connection.release();

        // Handle error after the release.
        if (error) {
          next(error);
        }

        // Don't use the connection here, it has been returned to the dbconnection.
        logger.debug("#results =", results.length);
        res.status(200).json({
          status: 200,
          result: results,
        });
      });
    });
  },
  getUserProfile: (req, res) => {
    const id = req.userId;

    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;

      connection.query(
        "SELECT * FROM user WHERE id = ?",
        [id],
        function (error, results, fields) {
          connection.release();

          if (error) throw error;

          logger.debug("#results =", results.length);
          if (results.length > 0) {
            res.status(200).json({
              status: 200,
              result: results,
            });
          } else {
            res.status(404).json({
              status: 404,
              message: `Could not find user with id: ${id}`,
            });
          }
        }
      );
    });
  },
  getUserById: (req, res) => {
    const id = req.params.userId;

    dbconnection.getConnection(function (err, connection) {
      if (err) throw err; // not connected!

      // Use the connection
      connection.query(
        "SELECT * FROM user WHERE id = ?;",
        [id],
        function (error, results, fields) {
          // When done with the connection, release it.
          connection.release();

          // Handle error after the release.
          if (error) throw error;

          // Don't use the connection here, it has been returned to the dbconnection.
          logger.debug("#results =", results.length);
          if (results.length > 0) {
            res.status(200).json({
              status: 200,
              result: results,
            });
          } else {
            res.status(404).json({
              status: 404,
              message: `Could not find user with id: ${id}`,
            });
          }
        }
      );
    });
  },
  updateUserById: (req, res) => {
    const id = req.params.userId;
    const updatedUser = req.body;
    logger.debug(`User with ID ${id} requested to be updated`);

    if (id != req.userId) {
      logger.debug(
        `Id's are not the same; requested: ${id} and logged-in user: ${req.userId}`
      );
      res.status(403).json({
        status: 403,
        message: "You can only change your own data",
      });
    } else {
      dbconnection.getConnection(function (err, connection) {
        if (err) throw err;
        connection.query(
          "UPDATE user SET firstName=?, lastName=?, isActive=?, emailAdress=?, password=?, phoneNumber=?, street=?, city=? WHERE id = ?;",
          [
            updatedUser.firstName,
            updatedUser.lastName,
            updatedUser.isActive,
            updatedUser.emailAdress,
            updatedUser.password,
            updatedUser.phoneNumber,
            updatedUser.street,
            updatedUser.city,
            id,
          ],
          function (error, results, fields) {
            if (error) {
              logger.info(error.sqlMessage);
              res.status(401).json({
                status: 401,
                message: `Updating user not possible, email is already taken.`,
              });
              return;
            }
            if (results.affectedRows > 0) {
              connection.query(
                "SELECT * FROM user WHERE id = ?;",
                [id],
                function (error, results, fields) {
                  connection.release();
                  logger.debug("User updated succesfully");

                  res.status(200).json({
                    status: 200,
                    result: results[0],
                  });
                }
              );
            } else {
              res.status(400).json({
                status: 400,
                message: `Could not find user with id: ${id}`,
              });
            }
          }
        );
      });
    }
  },
  deleteUserById: (req, res) => {
    let id = req.params.userId;

    if (id != req.userId) {
      logger.debug(
        `Id's are not the same; requested: ${id} and logged-in user: ${req.userId}`
      );
      res.status(403).json({
        status: 403,
        message: "You can only delete your own profile",
      });
    } else {
      dbconnection.getConnection(function (err, connection) {
        if (err) throw err; // not connected!

        // Use the connection
        connection.query(
          "DELETE FROM user WHERE id = ?;",
          [id],
          function (error, results, fields) {
            // When done with the connection, release it.
            connection.release();

            // Handle error after the release.
            if (error) throw error;

            // Don't use the connection here, it has been returned to the dbconnection.
            if (results.affectedRows > 0) {
              res.status(200).json({
                status: 200,
                message: `User with id: ${id} has been deleted.`,
              });
            } else {
              res.status(400).json({
                status: 400,
                message: `Could not find user with id: ${id}`,
              });
            }
          }
        );
      });
    }
  },
};

module.exports = controller;
