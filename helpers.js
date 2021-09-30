const bcrypt = require("bcryptjs");

// HELPER FUNCTION #1
// Genereate a "unique" shortURL (6 characters)
const generateRandomString = function() {
  return Math.random().toString(36).substr(2, 6);
};

// HELPER FUNCTION #2
// Create a new user (registration) object with given id, email, and password
const createUser = function(id, email, hashedPassword) {
  const user = {
    id,
    email,
    hashedPassword
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
const findUserByEmail = function(email, users) {
  for (const id in users) {
    if (users[id].email === email) {
      return id;
    }
  }
  return false;
};

// HELPER FUNCTION #5
// check to see if the password given matches the password (same email) in the database
const checkPassword = function(email, password, users) {
  for (const id in users) {
    if (users[id].email === email && bcrypt.compareSync(password, users[id].hashedPassword)) {
      return true;
    }
  }
  return false;
};

// HELPER FUNCTION #6
// check to see if shortURL exists in the database
const checkShortUrl = function(shortURL, urlDatabase) {
  for (const url in urlDatabase) {
    if(url === shortURL) {
      return true;
    }
  }
  return false;
};

// HELPER FUNCTION #7
// return the URLs where the userID is equal to the id of the current user
const urlsForUser = function(id, urlDatabase) {
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

module.exports = {
  generateRandomString,
  createUser,
  checkIfEmptyString,
  findUserByEmail,
  checkPassword,
  checkShortUrl,
  urlsForUser
}