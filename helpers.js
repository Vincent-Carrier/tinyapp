const { find } = require("lodash");

exports.getUserByEmail = function(email, db) {
  return find(db, usr => usr.email === email);
};
