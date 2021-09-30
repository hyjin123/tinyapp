const express = require("express");
const app = express(); // creating a server using express
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser"); // body-parser allows data (buffer) to be readable
app.use(bodyParser.urlencoded({extended:true}));
const cookieParser = require("cookie-parser");
app.use(cookieParser());

app.set("view engine", "ejs"); // setting the view engine as EJS

// storing shortURL and longURL (URL Database)
const urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "userRandomID"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "userRandomID"
  }
};

// storing the users and their log in information (Users Database)
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "a@example.com", 
    password: "123"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "b@example.com", 
    password: "123"
  }
};

// HELPER FUNCTION #1
// Genereate a "unique" shortURL (6 characters)
function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
};

// HELPER FUNCTION #2
// Create a new user (registration) object with given id, email, and password
const createUser = function(id, email, password) {
  const user = {
    id,
    email,
    password
  };
  return user;
};

// HELPER FUNCTION #3
// Check if the email or the passwords are empty strings.
const checkIfEmptyString = function(email, password) {
  if (email === "" || password === "") {
    return true;
  }
  return false;
};

// HELPER FUNCTION #4
// check to see if an email is already in the users database
const findUserByEmail = function(email) {
  for (const id in users) {
    if (users[id].email === email) {
      return id;
    }
  }
  return false;
};

// HELPER FUNCTION #5
// check to see if the password given matches the password (same email) in the database
const checkPassword = function(email, password) {
  for (const id in users) {
    if (users[id].email === email && users[id].password === password) {
      return true;
    }
  }
  return false;
};

// HELPER FUNCTION #6
// check to see if shortURL exists in the database
const checkShortUrl = function(shortURL) {
  for (const url in urlDatabase) {
    if(url === shortURL) {
      return true;
    }
  }
  return false;
};

// HELPER FUNCTION #7
// return the URLs where the userID is equal to the id of the current user
const urlsForUser = function(id) {
  // store the URLs that match the id
  const filteredDatabase = {};
  for (const url in urlDatabase) {
    if(urlDatabase[url].userID === id) {
      filteredDatabase[url] = {
        longURL: urlDatabase[url].longURL,
        userID: urlDatabase[url].userID
      }
    }
  }
  return filteredDatabase;
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req,res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// route to display a table of the URL Database (long and short URLS)
app.get("/urls", (req, res) => {
  const id = req.cookies["user_id"];
  // filter through the URL database
  const filteredDatabase = urlsForUser(id);
  const templateVars = {
    urls: filteredDatabase,
    user: users[req.cookies["user_id"]]
   };
  res.render("urls_index", templateVars);
});

// route to receive the form submission
app.post("/urls", (req, res) => {
  // if none logged in user adds a new url, return error message
  if (!req.cookies["user_id"]) {
    return res.status(400).send("You must be logged in to add URL!");
  }
  const newShortUrl = generateRandomString(); // generate a new short URL
   // add the key value pairs to the URL Database
  urlDatabase[newShortUrl] = {
    longURL: req.body.longURL,
    userID: req.cookies["user_id"]
  }
  res.redirect(`/urls/${newShortUrl}`); // redirect to the new URL page
});

// route to present the form to the user
app.get("/urls/new", (req, res) => {
  // if there is a user logged in, redirect to /urls/login
  if (!req.cookies["user_id"]) {
    return res.redirect("/login");
  }
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_new", templateVars);
});

// route to display long URL along with short URL (+ link to create new URL)
app.get("/urls/:shortURL", (req, res) => {
  const id = req.cookies["user_id"];
  // filter through the URL database
  const filteredDatabase = urlsForUser(id);
  const templateVars = {
    urls: filteredDatabase,
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.cookies["user_id"]]
   };
  res.render("urls_show", templateVars);
});

// route to handle shortURL requests, clicking on the shortURL will lead to the longURL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  // if the shortURL does not exist, return a error message
  if(checkShortUrl(shortURL)) {
    const longURL = urlDatabase[shortURL].longURL;
    return res.redirect(longURL);
  }
  res.status(400).send("This short URL does not exist!");
});

// route to remove a URL and redirect to the /urls page
app.post("/urls/:shortURL/delete", (req, res) => {
  const id = req.cookies["user_id"];
  // filter through the URL database
  const filteredDatabase = urlsForUser(id);
  const shortURL = req.params.shortURL;
  // check if shortURL is in the filtered database, if not, throw error
  if (!filteredDatabase[shortURL]) {
    return res.status(400).send("You cannot delete this.");
  }
  delete urlDatabase[shortURL]; // delete the shortURL property in the database
  res.redirect("/urls");
});

// route to update a URL and redirect to the /urls page
app.post("/urls/:shortURL", (req, res) => {
  const id = req.cookies["user_id"];
  // filter through the URL database
  const filteredDatabase = urlsForUser(id);
  const shortURL = req.params.shortURL;
  console.log(filteredDatabase)
  // check if shortURL is in the filtered database, if not, throw error
  if (!filteredDatabase[shortURL]) {
    return res.status(400).send("You cannot edit this.");
  }
  urlDatabase[shortURL].longURL = req.body.longURL; // update the longURL of the shortURL in the database
  res.redirect("/urls");
});

// route to handle a POST to /logout and clears the user_id cookie
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

// route to present the register page/form to the user
app.get("/register", (req, res) => {
  // if there is a user logged in, redirect to /urls
  if (req.cookies["user_id"]) {
    return res.redirect("/urls");
  }
  const templateVars = { 
    user: users[req.cookies["user_id"]]
   };
  res.render("urls_register", templateVars);
});

// route to handle the registration form data
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  // if email or password is empty, send an error message
  if (checkIfEmptyString(email, password)) {
    return res.status(400).send("Email or Password cannot be empty");
  }
  // if someone registers with existing email, send an error message
  if (findUserByEmail(email)) {
    return res.status(400).send("Email already exists");
  }
  // use the helper function create a user object
  const user = createUser(id, email, password);
  // add the new user object to the users database
  users[id] = user;
  // set user_id cookie contraining the user's newly generated ID
  res.cookie("user_id", id);
  res.redirect("/urls");
});

// route to present the login page to the user
app.get("/login", (req, res) => {
  // if there is a user logged in, redirect to /urls
  if (req.cookies["user_id"]) {
    return res.redirect("/urls");
  }
  const templateVars = { 
    user: users[req.cookies["user_id"]]
   };
  res.render("urls_login", templateVars);
});

// route to handle a POST to /login and set cookies
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  // if email is not in the database, return a 403 status code
  if(!findUserByEmail(email)) {
    return res.status(403).send("Email cannot be found");
  }
  // if password is not correct, return a 403 status code
  if(!checkPassword(email, password)) {
    return res.status(403).send("Wrong password!");
  }
  // find the ID using the helper function
  const id = findUserByEmail(email);
  res.cookie("user_id", id);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//bodyParser - another way for browser to give server information. not through URL but for ex. form.
//browser to server - req.params (giving info from browser to server using the url)
// server to browser - templateVars (it packages the varibales and gives to for ex. urls_show. the view needs those variables to display using EJS)