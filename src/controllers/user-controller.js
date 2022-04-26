let database = [];
let id = 0;

let controller = {
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
    res.status(200).json({
      status: 200,
      result: database,
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
      res.status(404).json({
        status: 404,
        result: `User with ID ${userId} not found`,
      });
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
