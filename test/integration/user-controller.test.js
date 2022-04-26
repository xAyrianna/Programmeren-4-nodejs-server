const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../index");

chai.should();
chai.use(chaiHttp);

describe("Manage users", () => {
  describe("UC-201 Register /api/user", () => {
    beforeEach((done) => {
      let database = [];
      done();
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
        })
        .end((err, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          status.should.equal(400);
          result.should.be
            .a("string")
            .that.equals("Firstname must be a string");
        });
      done();
    });
  });
});
