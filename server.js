
const sqlite3 = require('sqlite3').verbose();

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());

// create the users table if it doesn't already exist
function createTable() {
  // create a new database connection
  const db = new sqlite3.Database('users.db');

  // create the users table
  db.run(
    'CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT, email TEXT, password TEXT)'
  );
  db.run(
    'CREATE TABLE IF NOT EXISTS deals (id INTEGER PRIMARY KEY, description TEXT, user_id INTEGER)'
  );
  // close the database connection
  db.close();
}

// add a new user to the database
function addUser(name, email, password) {
  // create a new database connection
  const db = new sqlite3.Database('users.db');

  // insert the user data into the database
  db.run(
    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
    name,
    email,
    password
  );

  // close the database connection
  db.close();
}

// get a user from the database by email and password
function getUser(email, password, callback) {
  // create a new database connection
  const db = new sqlite3.Database('users.db');

  // get the user from the database
  db.all(
    'SELECT * FROM users WHERE email = ? AND password = ?',
    email,
    password,
    (err, user) => {
      // close the database connection
      db.close();

      // return the user to the callback
      callback(user);
    }
  );
}

// add a deal to the database for a given user
function addDeal(user_id, description) {
  // create a new database connection
  const db = new sqlite3.Database('users.db');

  // insert the deal data into the database
  db.run('INSERT INTO deals (user_id, description) VALUES (?,?)', user_id.toString(), description.toString());

  // close the database connection
  db.close();
}

function getDeals(user_id, callback) {
  // create a new database connection
  const db = new sqlite3.Database('users.db');
console.log("getting the deals for user_id =" + user_id)
  // get the user from the database
  db.all(
    'SELECT * FROM deals WHERE user_id = ?',
    user_id,
    (err, deals) => {
      // close the database connection
      db.close();

      console.log("DB found the deals:" + deals)
      // return the user to the callback
      callback(deals);
    }
  );
}

// create the users table if it doesn't already exist
createTable();

// add a user when the /add-user endpoint is called
app.post('/add-user', (req, res) => {
  // get the request data
  const data = req.body;

  // extract the user data
  const name = data.name;
  const email = data.email;
  const password = data.password;

  // add the user to the database
  addUser(name, email, password);

  // return a success message
  res.json({
    message: 'User added successfully'
  });
});

// get a user when the /get-user endpoint is called
app.post('/get-user', (req, res) => {
  // get the request data
  const data = req.body;

  // extract the user email and password
  const email = data.email;
  const password = data.password;

  // get the user from the database
  getUser(email, password, user => {
    // return the user to the caller
    res.json(user);
  });
});


// add deal when the /add-deal endpoint is called
app.post('/add-deal', (req, res) => {
  // get the request data
  const data = req.body;

  // extract the deal data
  const user_id = data.user_id;
  const description = data.description;

  // add the deal to the database
  addDeal(user_id, description)

  // return a success message
  res.json({
    message: 'Deal added successfully'
  });
});

// get a deals for a user when the /get-deals endpoint is called
app.post('/get-deals', (req, res) => {
  // get the request data
  const data = req.body;

  // extract the user email and password
  const user_id = data.user_id;

  // get the user from the database
  getDeals(user_id, deals => {
    console.log(deals)
    // return the user to the caller
    res.json(deals);
  });
});

// start the server on port 8080
app.listen(8080);
