const { find } = require("lodash");

exports.users = { };
exports.urlDatabase = { };

exports.getUserByEmail = function(email, db) {
  return find(db, usr => usr.email === email);
};

exports.generateRandomString = () =>
  Math.random()
    .toString(36)
    .substring(2, 8);

exports.loggedInUser = req => {
  const user = users[req.session.userID];
  return {
    userID: user ? user.id : null,
    email: user ? user.email : null
  }
}
