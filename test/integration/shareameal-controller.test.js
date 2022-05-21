process.env.DB_DATABASE = process.env.DB_DATABASE || "shareamealtestdb";

const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../index");
const dbconnection = require("../../database/dbconnection");
const jwt = require("jsonwebtoken");
const jwtSecretKey = require("../../src/config/config").jwtSecretKey;
const logger = require("../../src/config/config").logger;
let deliveryDate = new Date("2022-05-21")
  .toISOString()
  .replace("T", " ")
  .slice(0, 19);

chai.should();
chai.use(chaiHttp);

describe("Manage users", () => {
  before((done) => {
    dbconnection.getConnection(function (err, connection) {
      if (err) throw err; // not connected!

      // Use the connection
      connection.query("DELETE FROM meal;", function (error, results, fields) {
        // When done with the connection, release it.

        // Handle error after the release.
        if (error) throw error;
        // Let op dat je done() pas aanroept als de query callback eindigt!
      });
      connection.query(
        "DELETE FROM meal_participants_user;",
        function (error, results, fields) {
          if (error) throw error;
        }
      );
      connection.query("DELETE FROM user;", function (error, results, fields) {
        if (error) throw error;
      });
      connection.query(
        "ALTER TABLE user AUTO_INCREMENT = 1;",
        function (error, results, fields) {
          if (error) throw error;
        }
      );
      connection.query(
        "ALTER TABLE meal AUTO_INCREMENT = 1;",
        function (error, results, fields) {
          if (error) throw error;
        }
      );
      connection.query(
        "INSERT INTO user (firstName, lastName, emailAdress, password, phoneNumber, street, city) VALUES(?,?,?,?,?,?,?);",
        ["Davide", "Ambesi", "d.ambesi@avans.nl", "secret", "", "", ""],
        function (error, results, fields) {
          connection.release;

          if (error) throw error;
        }
      );
      connection.query(
        "INSERT INTO user (firstName, lastName, emailAdress, password, phoneNumber, street, city) VALUES(?,?,?,?,?,?,?);",
        ["Test", "Tester", "tTester@email.com", "secret", "", "", ""],
        function (error, results, fields) {
          if (error) throw error;
        }
      );
      connection.query(
        "INSERT INTO meal (name, description, dateTime, imageUrl, price) VALUES(?,?,?,?,?);",
        ["testMeal", "Meal to test", deliveryDate, "secret", 6.0],
        function (error, results, fields) {
          connection.release;

          if (error) throw error;
          done();
        }
      );
    });
  });
  describe("UC-201 Register /api/user", () => {
    it("User has been successfully added", (done) => {
      chai
        .request(server)
        .post("/api/user")
        .send({
          firstName: "Test2",
          lastName: "Tester",
          emailAdress: "tTester2@email.com",
          password: "secret",
          street: "",
          city: "",
          phoneNumber: "",
        })
        .end((err, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equal(201);
          message.should.be.a("string").that.equals("User has been added");
          done();
        });
    });
    it("When a required input is missing, a valid response should be returned", (done) => {
      chai
        .request(server)
        .post("/api/user")
        .send({
          //firstname is missing
          lastName: "Doe",
          emailAdress: "j.doe@servefr.com",
          password: "secret",
          street: "",
          city: "",
          phoneNumber: "",
        })
        .end((err, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equal(400);
          message.should.be
            .a("string")
            .that.equals("Firstname must be a string");
          done();
        });
    });
    it("When a user already exists, a valid response should be returned", (done) => {
      chai
        .request(server)
        .post("/api/user")
        .send({
          firstName: "Test2",
          lastName: "Tester",
          emailAdress: "tTester2@email.com",
          password: "secret",
          street: "",
          city: "",
          phoneNumber: "",
        })
        .end((err, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equal(409);
          message.should.be
            .a("string")
            .that.equals(
              "User with emailaddress: tTester2@email.com already exists."
            );
          done();
        });
    });
  });
  describe("UC-202 Get list of users /api/user", () => {
    it("Show zero users", (done) => {
      dbconnection.getConnection(function (err, connection) {
        if (err) throw err;

        connection.query("DELETE FROM user", function (err, results, fields) {
          if (err) throw err;
        });
        connection.query(
          "ALTER TABLE user AUTO_INCREMENT = 1;",
          function (err, results, fields) {
            if (err) throw err;

            connection.release();
          }
        );
      });
      chai
        .request(server)
        .get("/api/user")
        .set("authorization", "Bearer " + jwt.sign({ userid: 1 }, jwtSecretKey))
        .end((err, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          status.should.equal(200);
          result.should.be.an("array").that.is.empty;
          done();
        });
    });

    it("Show two users", (done) => {
      dbconnection.getConnection(function (err, connection) {
        if (err) throw err;

        connection.query(
          "INSERT INTO user (firstName, lastName, emailAdress, password, phoneNumber, street, city) VALUES(?,?,?,?,?,?,?);",
          ["Davide", "Ambesi", "d.ambesi@avans.nl", "secret", "", "", ""],
          function (error, results, fields) {
            if (error) throw error;
            connection.release;
          }
        );
      });
      dbconnection.getConnection(function (err, connection) {
        if (err) throw err;

        connection.query(
          "INSERT INTO user (firstName, lastName, emailAdress, password, phoneNumber, street, city, isActive) VALUES(?,?,?,?,?,?,?,?);",
          [
            "Student",
            "Tester",
            "studentTester@email.com",
            "hidden",
            "",
            "",
            "",
            0,
          ],
          function (error, result, fields) {
            if (error) throw error;
            connection.release;
          }
        );
      });
      chai
        .request(server)
        .get("/api/user")
        .set("authorization", "Bearer " + jwt.sign({ userid: 1 }, jwtSecretKey))
        .end((err, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          status.should.equal(200);
          result.should.be.an("array").that.has.a.lengthOf(2);
          done();
        });
    });
    it("Show users with query params with a non existing name", (done) => {
      chai
        .request(server)
        .get("/api/user?firstName=George")
        .set("authorization", "Bearer " + jwt.sign({ userid: 1 }, jwtSecretKey))
        .end((err, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          status.should.equal(200);
          result.should.be.an("array").that.is.empty;
          done();
        });
    });
    it("Show users with isActive = 0", (done) => {
      chai
        .request(server)
        .get("/api/user?isActive=0")
        .set("authorization", "Bearer " + jwt.sign({ userid: 1 }, jwtSecretKey))
        .end((err, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          status.should.equal(200);
          result.should.be.an("array").that.has.a.lengthOf(1);
          done();
        });
    });
    it("Show users with isActive = 1", (done) => {
      chai
        .request(server)
        .get("/api/user?isActive=1")
        .set("authorization", "Bearer " + jwt.sign({ userid: 1 }, jwtSecretKey))
        .end((err, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          status.should.equal(200);
          result.should.be.an("array").that.has.a.lengthOf(1);
          done();
        });
    });
    it("Show user with existing name in query param", (done) => {
      chai
        .request(server)
        .get("/api/user?firstName=Student")
        .set("authorization", "Bearer " + jwt.sign({ userid: 1 }, jwtSecretKey))
        .end((err, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          status.should.equal(200);
          result.should.be.an("array").that.has.a.lengthOf(1);
          done();
        });
    });
  });
  describe("UC-203 Get own userprofile /api/user/profile", () => {
    it("User has unauthorized token", (done) => {
      chai
        .request(server)
        .get("/api/user/profile")
        .set("authorization", "Bearer " + "unauthorized token")
        .end((err, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equal(401);
          message.should.be.an("string").that.equals("Not authorized");
          done();
        });
    });
    it("User has valid token and exists", (done) => {
      chai
        .request(server)
        .get("/api/user/profile")
        .set("authorization", "Bearer " + jwt.sign({ userid: 1 }, jwtSecretKey))
        .end((err, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          status.should.equal(200);
          result.should.be.an("array").that.has.a.lengthOf(1);
          done();
        });
    });
  });
  describe("UC-204 Get userprofile by id /api/user/:id", () => {
    it("When id doesn't exist, a valid response should be returned", (done) => {
      chai
        .request(server)
        .get("/api/user/6")
        .set("authorization", "Bearer " + jwt.sign({ userid: 1 }, jwtSecretKey))
        .end((err, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equal(404);
          message.should.be
            .a("string")
            .that.equals("Could not find user with id: 6");
          done();
        });
    });
    it("When id does exist, results show user", (done) => {
      dbconnection.getConnection(function (err, connection) {
        if (err) throw err;

        connection.query(
          "INSERT INTO user (firstName, lastName, emailAdress, password, phoneNumber, street, city) VALUES(?,?,?,?,?,?,?);",
          ["Test2", "Tester", "tTester2@email.com", "hidden", "", "", ""],
          function (error, results, fields) {
            if (error) throw error;
            connection.release;
          }
        );
      });
      chai
        .request(server)
        .get("/api/user/1")
        .set("authorization", "Bearer " + jwt.sign({ userid: 1 }, jwtSecretKey))
        .end((err, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          status.should.equal(200);
          result.should.be.an("array").that.has.a.lengthOf(1);
          done();
        });
    });
  });
  describe("UC-205 Update user by id /api/user/:id", () => {
    it("When a required input is missing, a valid response should be returned", (done) => {
      chai
        .request(server)
        .put("/api/user/1")
        .set("authorization", "Bearer " + jwt.sign({ userid: 1 }, jwtSecretKey))
        .send({
          //firstname is missing
          lastName: "Doe",
          emailAdress: "j.doe@servefr.com",
          password: "secret",
          street: "",
          city: "",
          phoneNumber: "",
        })
        .end((err, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equal(400);
          message.should.be
            .a("string")
            .that.equals("Firstname must be a string");
          done();
        });
    });
    it("When id doesn't exist, a valid response should be returned", (done) => {
      chai
        .request(server)
        .put("/api/user/6")
        .set("authorization", "Bearer " + jwt.sign({ userid: 6 }, jwtSecretKey))
        .send({
          firstName: "John",
          lastName: "Doe",
          emailAdress: "j.doe@servefr.com",
          password: "secret",
          street: "",
          city: "",
          phoneNumber: "",
        })
        .end((err, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equal(400);
          message.should.be
            .a("string")
            .that.equals("Could not find user with id: 6");
          done();
        });
    });
    it("When a user has been updated successfully", (done) => {
      chai
        .request(server)
        .put("/api/user/3")
        .set("authorization", "Bearer " + jwt.sign({ userid: 3 }, jwtSecretKey))
        .send({
          firstName: "Test2",
          lastName: "Tester",
          emailAdress: "tTester2@email.com",
          password: "hidden",
          street: "",
          isActive: "1",
          city: "",
          phoneNumber: "",
        })
        .end((err, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equal(200);
          done();
        });
    });
  });
  describe("UC-206 Delete user by id /api/user/:id", () => {
    it("When id doesnt exist, a valid response should be returned", (done) => {
      chai
        .request(server)
        .delete("/api/user/6")
        .set("authorization", "Bearer " + jwt.sign({ userid: 6 }, jwtSecretKey))
        .end((err, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equal(400);
          message.should.be
            .a("string")
            .that.equals("Could not find user with id: 6");
          done();
        });
    });
    it("When a user has been deleted successfully", (done) => {
      chai
        .request(server)
        .delete("/api/user/2")
        .set("authorization", "Bearer " + jwt.sign({ userid: 2 }, jwtSecretKey))
        .end((err, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equal(200);
          message.should.be
            .a("string")
            .that.equals("User with id: 2 has been deleted.");
          done();
        });
    });
  });
});
describe("Manage authentication", () => {
  describe("UC-101 Login /api/auth/login", () => {
    it("When a required input is missing, a valid response should be returned", (done) => {
      chai
        .request(server)
        .post("/api/auth/login")
        .send({
          emailAdress: "emailadress@email.com",
        })
        .end((err, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equal(400),
            message.should.be
              .a("string")
              .that.equals("password must be a string.");
          done();
        });
    });
    it.skip("When an invalid emailAddress has been given, a valid response should be returned", (done) => {});
    it.skip("When an invalid password has been given, a valid response should be returned", (done) => {});
    it("When user does not exist a valid response should be returned", (done) => {
      chai
        .request(server)
        .post("/api/auth/login")
        .send({
          emailAdress: "lalaa",
          password: "secret",
        })
        .end((err, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equal(404),
            message.should.be
              .a("string")
              .that.equals("User with email lalaa not found.");
          done();
        });
    });
    it("When a user has successfully logged in", (done) => {
      chai
        .request(server)
        .post("/api/auth/login")
        .send({
          emailAdress: "tTester2@email.com",
          password: "hidden",
        })
        .end((err, res) => {
          res.should.be.an("object");
          let { status } = res.body;
          status.should.equal(200), done();
        });
    });
  });
});
describe("Manage meals", () => {
  describe("UC-301 create a meal /api/meal", () => {
    it("When a required input is missing, a valid response should be returned", (done) => {
      chai
        .request(server)
        .post("/api/meal")
        .set("authorization", "Bearer " + jwt.sign({ userid: 1 }, jwtSecretKey))
        .send({
          // name is missing
          descriotion: "this is a test",
          isActive: 1,
          isVega: 1,
          isVegan: 1,
          isToTakeHome: 0,
          datetime: deliveryDate,
          imageUrl: "surprise",
          allergenes: "",
          maxAmountOfParticipants: 5,
          price: "6,00",
        })
        .end((err, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equal(400);
          message.should.be.a("string").that.equals("Name must be a string.");
          done();
        });
    });
    it("When a user is not logged in, a valid response should be retured", (done) => {
      chai
        .request(server)
        .post("/api/meal")
        .send({
          name: "Tester soup",
          description: "this is a test",
          isActive: 1,
          isVega: 1,
          isVegan: 1,
          isToTakeHome: 0,
          datetime: deliveryDate,
          imageUrl: "surprise",
          allergenes: "",
          maxAmountOfParticipants: 5,
          price: "6,00",
        })
        .end((err, res) => {
          res.should.be.an("object");
          let { status, error } = res.body;
          status.should.equal(401);
          error.should.be
            .a("string")
            .that.equals("Authorization header is missing!");
          done();
        });
    });
    it("Meal successfully added", (done) => {
      chai
        .request(server)
        .post("/api/meal")
        .set("authorization", "Bearer " + jwt.sign({ userid: 1 }, jwtSecretKey))
        .send({
          name: "Test Soup",
          description: "Good soup",
          isActive: 1,
          isVega: 0,
          isVegan: 0,
          isToTakeHome: 0,
          dateTime: "2022-05-25",
          imageUrl: "something",
          allergenes: "",
          maxAmountOfParticipants: 7,
          price: "4.20",
        })
        .end((err, res) => {
          res.should.be.an("object");
          let { status } = res.body;
          status.should.equal(201);
          done();
        });
    });
  });
});
