const assert = require("assert");
let database = [];
const dbconnection = require("../../database/dbconnection");
let id = 0;

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
        result: err.message,
      };

      next(error);
    }
  },
  addUser: (req, res) => {
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
  },
  getAllUsers: (req, res) => {
    dbconnection.getConnection(function (err, connection) {
      if (err) throw err; // not connected!

      // Use the connection
      connection.query(
        "SELECT firstName, lastName, emailAdress FROM user;",
        function (error, results, fields) {
          // When done with the connection, release it.
          connection.release();

          // Handle error after the release.
          if (error) throw error;

          // Don't use the connection here, it has been returned to the dbconnection.
          console.log("#results =", results.length);
          res.status(200).json({
            status: 200,
            result: results,
          });
          // dbconnection.end((err) => {
          //   console.log("pool was closed.");
          // });
        }
      );
    });
  },
  getUserProfile: (req, res) => {
    res.status(404).json({
      status: 404,
      result: "This endpoint hasn't been defined yet.",
    });
  },
  getUserById: (req, res) => {
    const userId = req.params.userId;
    let user = database.filter((item) => item.id == userId);
    if (user.length > 0) {
      console.log(user);
      res.status(200).json({
        status: 200,
        result: user,
      });
    } else {
      const error = {
        status: 404,
        result: `User with ID ${userId} not found`,
      };
      next(error);
    }
  },
  updateUserById: (req, res) => {
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
  },
  deleteUserById: (req, res) => {
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
  },
};

module.exports = controller;
