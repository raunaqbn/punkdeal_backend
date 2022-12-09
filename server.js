
const sqlite3 = require('sqlite3').verbose();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt')


const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(cors({
  origin: '*',
  methods: 'POST'
}));

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
      console.log("db getUser found " + user.email)
      // return the user to the callback
      callback(user);
    }
  );
}

async function getUserByEmail(email, callback) {
  const db = new sqlite3.Database('users.db');

  // get the user from the database
  const user = await new Promise((resolve, reject) => db.all(
    'SELECT * FROM users WHERE email = ?',
    email,
    (err, user) => {
      db.close();
      if (err) {
        reject(err)
      } else {

        console.log("db find by email found " + user[0])
        // return the user to the callback
        resolve(user);
      }
    }));

    console.log ("testing " + user)
    console.log ("testing " + user.name)
    callback(user)

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
// We use bcrypt here to make sure that the passwords are stored encrypted
app.post('/register', async (req, res) => {
  console.log("Raunaq got a register call")
  // get the request data
  const data = req.body;

  // extract the user data
  const name = data.name;
  const email = data.email;
  const password = data.password;
  console.log("name:" + name)
  console.log("password:" + password)
  console.log("email:" + email)

  // Generate a salt so that same passwords don't have the same hash
  // Furthermore hash the password before storing it in the sql database
  try {
    const hashedPassword = await bcrypt.hash(password, 10)

    // add the user to the database
    addUser(name, email, password);
    res.status(200).json({
        success:true,
        redirectUrl: '/login'
    })
  }
  catch {
    res.status(200).json({
      success:fail,
      redirectUrl: '/register'
    })
  }
});


// add a user when the /add-user endpoint is called
// We use bcrypt here to make sure that the passwords are stored encrypted
app.post('/login',  async (req, res) => {
  console.log("Raunaq got a login call")
  // get the request data
  const data = req.body;

  // extract the user data
  const email = data.email;
  const password = data.password;
  console.log("password:" + password)
  console.log("email:" + email)

  // // get the user from the database
  //  getUserByEmail(email,  user => {
  //   console.log("user password given:" + password + "password in db" + user.password)
  //   console.log("user found :" + user)
  //   if (user == null) {
  //     return res.status(400).send('Cannot find user')
  //   }
  //   try {
  //     console.log("user password given:" + password + "password in db" + user.password)
  //     // if(await bcrypt.compare(password, user.password)) {
  //     //   res.json(user).send('Success')
  //     // } else {
  //     //   res.send('Wrong Password')
  //     // }
  //     res.send(user)
  //   } catch {
  //     res.status(500).send()
  //   }
  // })
  const hashedPassword = await bcrypt.hash(password, 10)
  getUser(email, password, user => {
    // return the user to the caller

    res.json(user);
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
