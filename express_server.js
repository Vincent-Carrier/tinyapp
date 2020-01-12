const {
  users,
  urlDatabase,
  getUserByEmail,
  generateRandomString,
  loggedInUser
} = require("./helpers");
const express = require("express");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");

const app = express();
const PORT = 3000; // default port 8080

app.use(
  cookieSession({
    name: "session",
    keys: ["MYSUPERSECRETKEY"],
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  })
);

app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  if (req.session.userID) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/register", (req, res) => {
  let templateVars = loggedInUser(req);
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = loggedInUser(req);
  res.render("login", templateVars);
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).send("Missing email or password");
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
    res.status(403).send("Couldn't match your email and password.");
  }
});

app.post("/logout", (req, res) => {
  delete req.session.userID;
  res.redirect("/login");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  let templateVars = loggedInUser(req);
  if (templateVars.userID) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls", (req, res) => {
  if (req.session.userID) {
    let userURLs = {};
    for (let shortURL in urlDatabase) {
      if (urlDatabase[shortURL].userID === req.session.userID) {
        userURLs[shortURL] = urlDatabase[shortURL];
      }
    }
    let templateVars = {
      urls: userURLs,
      ...loggedInUser(req)
    };
    res.render("urls_index", templateVars);
  } else {
    res.send("You need to be logged in to access this page");
  }
});

app.post("/urls", (req, res) => {
  const key = generateRandomString();
  urlDatabase[key] = {
    longURL: req.body.longURL,
    userID: req.session.userID
  };
  res.redirect(`/urls/${key}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const key = req.params.shortURL;
  const url = urlDatabase[key];
  if (url.userID !== req.session.userID) {
    res.status(403).send("Access Denied. Cannot modify an URL you don't own");
  } else {
    delete urlDatabase[key];
    res.redirect("/urls");
  }
});

app.post("/urls/:shortURL", (req, res) => {
  const key = req.params.shortURL;
  const url = urlDatabase[key];
  if (url.userID !== req.session.userID) {
    res.status(403).send("Access Denied. Cannot modify an URL you don't own");
  } else {
    urlDatabase[key].longURL = req.body.newURL;
    res.redirect(`/urls/${key}`);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const key = req.params.shortURL;
  const url = urlDatabase[key];
  if (url.userID !== req.session.userID) {
    res.status(403).send("Access Denied. Cannot modify an URL you don't own");
  } else {
    let templateVars = {
      shortURL: key,
      longURL: urlDatabase[key].longURL,
      ...loggedInUser(req)
    };
    res.render("urls_show", templateVars);
  }
});

app.get("/u/:shortURL", (req, res) => {
  console.log("URLS: ", urlDatabase);
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on http://localhost:${PORT}!`);
});
