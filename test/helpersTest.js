const { assert } = require('chai');

const {
  generateRandomString,
  createUser,
  checkIfEmptyString,
  findUserByEmail,
  checkPassword,
  checkShortUrl,
  urlsForUser
} = require('../helpers.js');

const users = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

const urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "userRandomID"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "123456"
  }
};

describe('generateRandomString', function() {
  it('should return a 6 alpha-numeric string', function() {
    const randomString = generateRandomString();
    const expectedOutput = 6
    assert.strictEqual(randomString.length, expectedOutput);
  });
});

describe('createUser', function() {
  it('should create a user object with all the info', function() {
    const user = createUser("abc", "abc@example.com", "123456")
    const expectedOutput = {
      id: "abc",
      email: "abc@example.com",
      hashedPassword: "123456"
    }
    assert.deepEqual(user, expectedOutput);
  });
});

describe('checkIfEmptyString', function() {
  it('should return true if email or password is empty string', function() {
    const empty = checkIfEmptyString("", "abc");
    const expectedOutput = true;
    assert.strictEqual(empty, expectedOutput);
  });

  it('should return false if email or password is not empty string', function() {
    const empty = checkIfEmptyString("cdc", "abc");
    const expectedOutput = false;
    assert.strictEqual(empty, expectedOutput);
  });
});

describe('checkShortUrl', function() {
  it('should return true if shortURL exists in the database', function() {
    const shortURL = checkShortUrl("b6UTxQ", urlDatabase);
    const expectedOutput = true;
    assert.strictEqual(shortURL, expectedOutput);
  });

  it('should return false if shortURL does not exist in the database', function() {
    const shortURL = checkShortUrl("b6UTxw", urlDatabase);
    const expectedOutput = false;
    assert.strictEqual(shortURL, expectedOutput);
  });
});

describe('urlsForUser', function() {
  it('return URLs if the userID is equal to the id passed', function() {
    const url = urlsForUser("userRandomID", urlDatabase)
    const expectedOutput = {
      b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "userRandomID"
      }
    };
    assert.deepEqual(url, expectedOutput);
  });
});

describe('findUserByEmail', function() {
  it('should return a user ID with valid email', function() {
    const user = findUserByEmail("user@example.com", users)
    const expectedOutput = "userRandomID";
    assert.strictEqual(user, expectedOutput);
  });

  it('should return false if email is not valid', function() {
    const user = findUserByEmail("user123@example.com", users)
    const expectedOutput = false;
    assert.strictEqual(user, expectedOutput);
  });
});