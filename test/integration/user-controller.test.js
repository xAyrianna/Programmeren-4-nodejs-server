process.env.DB_DATABASE = process.env.DB_DATABASE || "shareamealtestdb";

const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../index");
const dbconnection = require("../../database/dbconnection");

chai.should();
chai.use(chaiHttp);

describe("Manage users", () => {
  describe("UC-201 Register /api/user", () => {
    before((done) => {
      dbconnection.getConnection(function (err, connection) {
        if (err) throw err; // not connected!

        // Use the connection
        connection.query(
          "DELETE FROM meal;",
          function (error, results, fields) {
            // When done with the connection, release it.

            // Handle error after the release.
            if (error) throw error;
            // Let op dat je done() pas aanroept als de query callback eindigt!
          }
        );
        connection.query(
          "DELETE FROM meal_participants_user;",
          function (error, results, fields) {
            if (error) throw error;
          }
        );
        connection.query(
          "DELETE FROM user;",
          function (error, results, fields) {
            if (error) throw error;
          }
        );
        connection.query(
          "ALTER TABLE user AUTO_INCREMENT = 1;",
          function (error, results, fields) {
            connection.release;

            if (error) throw error;

            done();
          }
        );
      });
    });
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
          let { status, result } = res.body;
          status.should.equal(201);
          result.should.be.a("string").that.equals("User has been added");
          done();
        });
    });
    it("When a required input is missing, a valid error should be returned", (done) => {
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
          let { status, result } = res.body;
          status.should.equal(400);
          result.should.be
            .a("string")
            .that.equals("Firstname must be a string");
          done();
        });
    });
    it("When a user already exists, a valid error should be returned", (done) => {
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
          let { status, result } = res.body;
          status.should.equal(409);
          result.should.be
            .a("string")
            .that.equals(
              "User with emailaddress: tTester2@email.com already exists."
            );
          done();
        });
    });
  });
  describe("UC-204 Get userprofile by id /api/user/:id", () => {
    it("When id doesn't exist, a valid error should be returned", (done) => {
      chai
        .request(server)
        .get("/api/user/6")
        .end((err, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          status.should.equal(404);
          result.should.be
            .a("string")
            .that.equals("Could not find user with id: 6");
          done();
        });
    });
    it("When id does exist, results show user", (done) => {
      chai
        .request(server)
        .get("/api/user/1")
        .end((err, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          status.should.equal(200);
          done();
        });
    });
  });
  describe("UC-205 Update user by id /api/user/:id", () => {
    it("When a required input is missing, a valid error should be returned", (done) => {
      chai
        .request(server)
        .put("/api/user/1")
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
          let { status, result } = res.body;
          status.should.equal(400);
          result.should.be
            .a("string")
            .that.equals("Firstname must be a string");
          done();
        });
    });
    it("When id doesn't exist, a valid error should be returned", (done) => {
      chai
        .request(server)
        .put("/api/user/6")
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
          let { status, result } = res.body;
          status.should.equal(400);
          result.should.be
            .a("string")
            .that.equals("Could not find user with id: 6");
          done();
        });
    });
    it("When a user has been updated successfully", (done) => {
      chai
        .request(server)
        .put("/api/user/1")
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
          let { status, result } = res.body;
          status.should.equal(200);
          done();
        });
    });
  });
  describe("UC-206 Delete user by id /api/user/:id", () => {
    it("When id doesnt exist, a valid error should be returned", (done) => {
      chai
        .request(server)
        .delete("/api/user/6")
        .end((err, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          status.should.equal(400);
          result.should.be
            .a("string")
            .that.equals("Could not find user with id: 6");
          done();
        });
    });
    it("When a user has been deleted successfully", (done) => {
      chai
        .request(server)
        .delete("/api/user/1")
        .end((err, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          status.should.equal(200);
          result.should.be
            .a("string")
            .that.equals("User with id: 1 has been deleted.");
          done();
        });
    });
  });
});
