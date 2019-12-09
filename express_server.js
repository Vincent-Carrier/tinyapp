const express = require("express");
const app = express();
const PORT = 3000; // default port 8080
const path = require('path');

app.set("view engine", "ejs");

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const key = req.params.shortURL;
  let templateVars = { shortURL: key, longURL: urlDatabase[key] };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on http://localhost:${PORT}!`);
});
