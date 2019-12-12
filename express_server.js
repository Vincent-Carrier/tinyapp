const express = require("express");
const app = express();
const PORT = 3000; // default port 8080

const cookieParser = require("cookie-parser");
app.use(cookieParser());

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

const generateRandomString = () =>
  Math.random()
    .toString(36)
    .substring(2, 8);

const urlDatabase = {
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" }
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]] };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]] };
  res.render("login", templateVars);
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    res.send("Missing email or password");
  }
  const id = generateRandomString();
  users[id] = { id, email, password };
  res.cookie("user_id", id);
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  let match = false;
  for (const id in users) {
    const usr = users[id];
    if (usr.email === email && usr.password === password) {
      match = true;
      res.cookie("user_id", id).redirect("/urls");
      return;
    }
  }
  if (!match) {
    res.status(403);
    res.send("Couldn't match your email and password.");
    res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]] };
  if (templateVars.user) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]] };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const key = generateRandomString();
  urlDatabase[key] = { longURL: req.body.longURL, userID: users[req.cookies["user_id"]] };
  res.redirect(`/urls/${key}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const key = req.params.shortURL;
  const url = urlDatabase[key];
  if (url.userID !== users[req.cookies["user_id"]]) {
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
  if (url.userID !== users[req.cookies["user_id"]]) {
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
  if (url.userID !== users[req.cookies["user_id"]]) {
    res.status(403);
    res.send("Access Denied. Cannot modify an URL you don't own");
  } else {
    let templateVars = {
      shortURL: key,
      longURL: urlDatabase[key],
      user: users[req.cookies["user_id"]]
    };
    res.render("urls_show", templateVars);
  }
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on http://localhost:${PORT}!`);
});
