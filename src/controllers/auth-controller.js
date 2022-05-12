const assert = require("assert");
const dbconnection = require("../../database/dbconnection");
const jwt = require("jsonwebtoken");
require("dotenv").config();

let controller = {
  login: (req, res, next) => {
    //Assert for validation
    const { emailAdress, password } = req.body;
    console.log(emailAdress + " " + password);

    const queryString =
      "SELECT id, firstName, lastName, emailAdress, password FROM user WHERE emailAdress = ?";

    dbconnection.getConnection(function (err, connection) {
      if (err) {
        next(err);
      } // not connected!

      // Use the connection
      connection.query(
        queryString,
        [emailAdress],
        function (error, results, fields) {
          // When done with the connection, release it.
          connection.release();

          // Handle error after the release.
          if (error) {
            next(error);
          }

          if (results && results.length === 1) {
            // User found with this emailAddress
            // Check if password's correct
            console.log(results);

            const user = results[0];

            if (user.password === password) {
              //email and password are correct
              jwt.sign(
                { userid: user.id },
                process.env.JWT_SECRET,
                { expiresIn: "25d" },
                function (err, token) {
                  if (err) console.log(err);
                  if (token) {
                    console.log(token);
                    res.status(200).json({
                      status: 200,
                      result: token,
                    });
                  }
                }
              );
            } else {
              console.log("Password is not correct");
              res.status(404).json({
                status: 404,
                message: "Password is not correct",
              });
            }
          } else {
            //User not found
            console.log("User not found");
            res.status(404).json({
              status: 404,
              message: "email not found",
            });
          }
        }
      );
    });
  },
  validate: (req, res, next) => {},
};

module.exports = controller;
