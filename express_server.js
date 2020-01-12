const { getUserByEmail } = require("./helpers");
const express = require("express");
const app = express();
const PORT = 3000; // default port 8080

const bcrypt = require("bcrypt");

const cookieSession = require("cookie-session");
app.use(
  cookieSession({
    name: "session",
    keys: ["MYSUPERSECRETKEY"],
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  })
);

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

const generateRandomString = () =>
  Math.random()
    .toString(36)
    .substring(2, 8);

const urlDatabase = {
  // b2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" }
};

const users = {
  // userRandomID: {
  //   id: "userRandomID",
  //   email: "user@example.com",
  //   password: "purple-monkey-dinosaur"
  // },
  // user2RandomID: {
  //   id: "user2RandomID",
  //   email: "user2@example.com",
  //   password: "dishwasher-funk"
  // }
};

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  let templateVars = {
    user: req.session.userID,
    email: users[req.session.userID]
  };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = {
    user: req.session.userID,
    email: users[req.session.userID]
  };
  res.render("login", templateVars);
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    res.send("Missing email or password");
  }
  const id = generateRandomString();
  users[id] = { id, email, password: bcrypt.hashSync(password, 10) };
  req.session.userID = id;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email, users);
  if (user && bcrypt.compareSync(password, user.password)) {
    req.session.userID = user.id;
    res.redirect("/urls");
  } else {
    res.status(403);
    res.send("Couldn't match your email and password.");
  }
});

app.post("/logout", (req, res) => {
  delete req.session.userID;
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { user: users[req.session.userID] };
  if (templateVars.user) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user: users[req.session.userID]
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const key = generateRandomString();
  urlDatabase[key] = {
    longURL: req.body.longURL,
    userID: req.session.userID,
  };
  res.redirect(`/urls/${key}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const key = req.params.shortURL;
  const url = urlDatabase[key];
  if (url.userID !== req.session.userID) {
    res.status(403);
    res.send("Access Denied. Cannot modify an URL you don't own");
  } else {
    delete urlDatabase[key];
    res.redirect("/urls");
  }
});

app.post("/urls/:shortURL", (req, res) => {
  const key = req.params.shortURL;
  const url = urlDatabase[key];
  if (url.userID !== req.session.userID) {
    res.status(403);
    res.send("Access Denied. Cannot modify an URL you don't own");
  } else {
    urlDatabase[key] = req.body.newURL;
    res.redirect(`/urls/${key}`);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const key = req.params.shortURL;
  const url = urlDatabase[key];
  if (url.userID !== req.session.userID) {
    res.status(403);
    res.send("Access Denied. Cannot modify an URL you don't own");
  } else {
    let templateVars = {
      shortURL: key,
      longURL: urlDatabase[key],
      user: req.session.userID,
      email: users[req.session.userID].email
    };
    res.render("urls_show", templateVars);
  }
});

app.get("/u/:shortURL", (req, res) => {
  console.log(urlDatabase)
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on http://localhost:${PORT}!`);
});
