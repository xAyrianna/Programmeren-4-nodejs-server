const assert = require("assert");
const dbconnection = require("../../database/dbconnection");
const jwt = require("jsonwebtoken");
const jwtSecretKey = require("../config/config").jwtSecretKey;
const logger = require("../config/config").logger;

let controller = {
  login: (req, res, next) => {
    //Assert for validation
    const { emailAdress } = req.body;
    logger.debug(emailAdress, " ", req.body.password);

    const queryString =
      "SELECT id, firstName, lastName, emailAdress, password FROM user WHERE emailAdress = ?";

    dbconnection.getConnection(function (err, connection) {
      if (err) {
        logger.error("Error getting connection from dbconnection");
        res.status(500).json({
          error: err.toString(),
          datetime: new Date().toISOString,
        });
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
            logger.error("Error: ", err.toString());
            res.status(500).json({
              error: err.toString(),
              datetime: new Date().toISOString(),
            });
          }

          if (results && results.length === 1) {
            // User found with this emailAddress
            // Check if password's correct
            if (results[0].password === req.body.password) {
              //email and password are correct
              logger.info(
                "passwords matched, sending userinfo en valid token."
              );

              const { password, ...userinfo } = results[0];
              const payload = {
                userId: userinfo.id,
              };

              jwt.sign(
                payload,
                jwtSecretKey,
                { expiresIn: "25d" },
                function (err, token) {
                  if (token) {
                    logger.info("User logged in, sending: ", userinfo);
                    res.status(200).json({
                      status: 200,
                      results: { ...userinfo, token },
                    });
                  }
                }
              );
            } else {
              logger.info("User not found or password invalid");
              res.status(401).json({
                status: 401,
                message: "User not found or password invalid",
                datetime: new Date().toISOString,
              });
            }
          }
        }
      );
    });
  },
  validateLogin: (req, res, next) => {
    //Make sure you have the expected input
    try {
      assert(
        typeof req.body.emailAdress === "string",
        "email must be a string."
      );
      assert(
        typeof req.body.password === "string",
        "password must be a string."
      );
      next();
    } catch (ex) {
      res.status(422).json({
        error: ex.toString(),
        datetime: new Date().toISOString(),
      });
    }
  },
  validateToken: (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      logger.warn("Authorization header is missing!");
      res.status(401).json({
        error: "Authorization header missing!",
        datetime: new Date().toISOString,
      });
    } else {
      const token = authHeader.substring(7, authHeader.length);
      logger.debug(token);

      jwt.verify(token, jwtSecretKey, (err, payload) => {
        logger.debug(payload);
        if (err) {
          logger.warn(err.message);
          res.status(401).json({
            status: 401,
            error: "Not authorized",
            datetime: new Date().toISOString,
          });
        }
        if (payload) {
          logger.debug("token is valid", payload);
          //User has acces. Add userId from payload to
          //request, for every next endpoint
          logger.debug(payload.userid);
          req.userId = payload.userid;
          next();
        }
      });
    }
  },
};

module.exports = controller;
