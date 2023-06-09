//=============================================================================
//                              App.js (Backend)
//
//  This is the main backend controlling file. This handles all requests from
//  the frontend (http://localhost:3000). Connects frontend with database in
//  a managed way. All data processing/sanitisation goes on here.
//
//                              By Harry Yelland
//=============================================================================



// All requires
var express = require("express");
const mysql = require("mysql");
const cors = require("cors");
var app = express();
var fs = require("fs");
const { isObject } = require("util");
var readline = require('readline');
const crypto = require('crypto');

// Use Express and Cross Origin Request Libraries
app.use(express.json());
app.use(cors());

// Set the port for the backend to 3001
const THIS_PORT = 3001;
// Set the frontend to be at localhost (port 3000)
const FRONTEND_ADDRESS = 'https://localhost:3000';

// Create a list of all possible characters for salt & pepper use later
const allChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789";

// Varaible for storing all sessions in
var sessions = [];



//=============================================================================
//                                 verify-session()
//  Function to check a session exists
//
//                        Parameters: N/A (No input parameters)
//
//                              Returns: SessionID (64 Chars)
// 
//=============================================================================
app.post("/verify-session", (req, res) => {
  res.set('Access-Control-Allow-Origin', 'https://localhost:3000'); 
  var newSession = req.body.session;
  console.log("User Session")
  console.log(newSession);
  for(let i=0; i<sessions.length; i++){
    if(sessions[i][0] === newSession){
      res.send("true");
      return true;
    }
  }
  res.send("false");
  return false;
});

app.post("/log-frontend", (req, res) => {});



//=============================================================================
//                                databaseCreation()
//  This function runs the db-creation.sql file. Database connection
//  established using the environmental variables found in db-config.json.
//  Uses 'IF NOT EXISTS' statements so should always ensure that database 
//  exists before system boots.
//
//               Parameters: N/A (All inputs hard-coded/loaded from file)
//
//                              Returns: N/A (No return)
//
//  References/Sources:
//  https://stackoverflow.com/questions/22276763/use-nodejs-to-run-an-sql-file-in-mysql
//=============================================================================
function databaseCreation(){
  //Create a connection to the database using environment variables
  var dbCreate = mysql.createConnection({
    host: dbHost,
    user: dbUser,
    password: dbPassword,
    database: dbDatabase
  });

  //Read the db-creation sql file
  var rl = readline.createInterface({
    input: fs.createReadStream('db-creation.sql'),
    terminal: false
  });
  // Run the file line-by-line as multiple statements
  rl.on('line', function(chunk){
    dbCreate.query(chunk.toString('ascii'), function(err, sets, fields){
      // If there is an error in the sql, log it
      if(err) console.log(err);
    });
  });
  // Once file has been run, inform the backend admin that process has finished
  rl.on('close', function(){
    //console.log("Finished Running Database Creation");
    // Close connection as no longer needed
    dbCreate.end();
  });
}


//=============================================================================
//                                 generateSessionID()
//  Function to create a sessionid for the user. 
//
//                        Parameters: N/A (No input parameters)
//
//                              Returns: SessionID (64 Chars)
// 
//=============================================================================
function generateSessionID(){
  var sessionid = "";
// Generate a random 12 character sessionid
  for(let i = 0; i < 12; i ++){
    // Generate random char from allchars constant
    var char = allChars.charAt(Math.floor(Math.random() * allChars.length));
    // Add character to sessionid
    sessionid += char;
  }
  //Hash sessionid to make 64 characters
  sessionid = addHash(sessionid);
  return sessionid
}


//=============================================================================
//                                 generateSalt()
//  Function to create a salt for the password. Should generate a 10 character
//  string.
//
//                        Parameters: N/A (No input parameters)
//
//                              Returns: Salt (10 char string)
// 
//=============================================================================
 function generateSalt(){
  var salt = "";
// Generate a random 10 character salt
  for(let i = 0; i < 10; i ++){
    // Generate random char from allchars constant
    var char = allChars.charAt(Math.floor(Math.random() * allChars.length));
    // Add character to salt
    salt += char;
  }
  return salt
}



//=============================================================================
//                                   addSalt()
//  Function for adding salt to a password. Should take the salt (10 chars), 
//  split it and put the first 5 chars at the start of the password and the
//  second 5 chars at the end of the password.
//
//                  Parameters: Password (String), Salt (10 Char String)
//
//                       Returns: Improved Password (Salted Password)
// 
//=============================================================================
function addSalt(rawPassword, salt){
  // Adds first 5 characters of salt
  var improvedPassword = salt.slice(0, 5)
  // Adds the original password inbetween
  improvedPassword += rawPassword
  // Adds final 5 characters of salt
  improvedPassword += salt.slice(5, 10)
  // returns the salted password
  return improvedPassword;
}



//=============================================================================
//                                generatePepper()
//  Function to generate a single character for the pepper.
//
//
//                       Parameters: N/A (No input parameters)
//
//                        Returns: Pepper (Single Char String)
// 
//=============================================================================
function generatePepper(){
  // Generate random char from allchars constant for a pepper
  var pepper  = allChars.charAt(Math.floor(Math.random() * allChars.length));
  return pepper
}



//=============================================================================
//                                 addPepper()
//  Function for adding the single char pepper to the salted password.
//
//
//                 Parameters: (Salted) Password, (Single Char) Pepper
//
//                    Returns: improvedPassword (Peppered Password)
// 
//=============================================================================
function addPepper(rawPassword, pepper){
  // adds pepper char 
  var improvedPassword = pepper;
  // adds pre-salted password
  improvedPassword += rawPassword;
  // returns peppered password
  return improvedPassword;
}



//=============================================================================
//                                   addHash()
//  Function to generate the SHA256 hashed version of the password to store
//  in the database. Uses crypto library to generate. Should be applied to an
//  already salted & peppered password.
//
//                       Parameters: (Salted & Peppered) Password
//
//                              Returns: Hashpwd
// 
//  References/Sources:
//  https://www.geeksforgeeks.org/how-to-create-hash-from-string-in-javascript/  
//
//=============================================================================
function addHash(rawPassword){
  hashPwd = crypto.createHash('sha256').update(rawPassword).digest('hex');
  return hashPwd;
}



//=============================================================================
//                                generatePassword
//  Takes the original password that the user inputted, puts the password
//  through the salt, pepper and hash functions to created a much more secure,
//  salt-pepper-hash password.
//
//                    Parameters: rawPassword (User inputted password)
//
//                  Returns: Array of: [salt-pepper-hash password, salt]
// 
//=============================================================================
function generatePassword(rawPassword){
  // Gets a salt
  var salt = generateSalt();
  // Gets a pepper
  var pepper = generatePepper();
  // Add salt to password
  var improvedPassword = addSalt(rawPassword, salt);
  // Adds pepper to salted password
  improvedPassword = addPepper(improvedPassword, pepper);
  // Adds hash to salt-pepper password
  improvedPassword = addHash(improvedPassword);
  // returns password and salt for db storage
  return [improvedPassword, salt];
}



//=============================================================================
//                                checkPassword()
//  Function for checking the password entered at login by the user. Gets the
//  password, adds salt, pepper and then hash - checks against hashed password
//  in the database. Sets correct true/false based on password validity.
//
//                       Parameters: Username, Password, Salt
//
//                            Returns: Correct (Boolean)
// 
//=============================================================================
function checkPassword(username, rawPassword, salt){
  var correct = false;
  // Adds the salt to the password
  var saltedPassword = addSalt(rawPassword, salt);
  console.log("salted password");
  console.log(saltedPassword);

  var correctPassword = "";
  console.log("Username: " + username + " Salt: " + salt)

  db.query(
    "SELECT password FROM staff WHERE username = ?;",
    [username],
    (err, result) => {
      if (err) {
        console.log(err);
      }
      //console.log(result);
      correctPassword = result[0].password;
      //console.log("Correct Password")
      //console.log(correctPassword)
      // Runs through every possible pepper
      for(let i=0; i<allChars.length; i++){
        var improvedPassword = addPepper(saltedPassword, allChars.charAt(i))
        // hashes the salt-pepper password
        improvedPassword = addHash(improvedPassword);
        //console.log(improvedPassword);
        // gets the password from the db
        if(correctPassword === improvedPassword){
          console.log("Found Match")
          correct = true;
        }
      }
      // returns if the attempt was correct
      return correct;
    }
  );
}



//list of chars taken from https://www.folkstalk.com/tech/avoid-sql-injection-in-password-field-with-code-examples/
const sqlChars = [
  "{",
  ",",
  '"',
  "\\",
  "}",
  "%",
  "&",
  "'",
  "(",
  ")",
  "*",
  "+",
  "-",
  ".",
  "/",
  ":",
  ";",
  "<",
  "=",
  ">",
  "[",
  "|",
  "\t",
  "\n",
];



// https://www.w3schools.com/sql/sql_ref_keywords.asp
const sqlPhrases = [
  "SELECT",
  "DELETE",
  "UPDATE",
  "TABLE",
  "CREATE",
  "WHERE",
  "DROP",
  "ORDER",
  "GROUP",
  "JOIN"
]



const cssPhrases = [
  "<SCRIPT>",
  "<SCRIPT/>",
  "SCRIPT",
  "<STYLE>",
  "<STYLE/>",
  "ALERT(",
  "<XSS",
  "XSS",
  "<BODY",
  "<BODY",
  "BODY",
  "<SVG>",
  "SVG",
  "<MARQUEE",
  "MARQUEE",
  "<AUDIO",
  "<AUDIO>",
  "<SOURCE",
  "<VIDEO",
  "<VIDEO>",
  "<A>",
  "<A",
  "<SPAN",
  "<SPAN>",
  "<DETAILS>",
  "<DETAILS"
]



//=============================================================================
//  Establishes a connection to the database that can be pooled throughout
//  for all queries. Uses login details for db found in db-config.json
//
//=============================================================================
try {
  let rawdata = fs.readFileSync("db-config.json");
  let dbConfig = JSON.parse(rawdata);
  dbHost = dbConfig.host;
  dbUser = dbConfig.user;
  dbPassword = dbConfig.password;
  dbDatabase = dbConfig.database;
} catch (e) {
  console.log("Error:", e.stack);
}

const db = mysql.createConnection({
  host: dbHost,
  user: dbUser,
  password: dbPassword,
  database: dbDatabase,
});



//=============================================================================
//                                  sqlInject()
//  Function to test if SQL has been injected into the user's input. Checks
//  for both escape characters and SQL keywords. Returns boolean value (false
//  if no SQL injection, true if injected).
//
//                            Parameters: data (String)
//
//                              Returns: hasSQL (Boolean)
// 
//  References/Sources:
//  https://www.folkstalk.com/tech/avoid-sql-injection-in-password-field-with-code-examples/
//  https://www.w3schools.com/sql/sql_ref_keywords.asp
//
//=============================================================================
function sqlInject(data) {
  var hasSQL = false;
  var hasSQLChar = false;
  for(let i=0; i<sqlPhrases.length; i++){
    if(data.includes(sqlChars[i])){
      hasSQLChar = true;
    }
  }

  var hasSQLString = false;
  for(let i=0; i<sqlPhrases.length; i++){
    if(data.toUpperCase().includes(sqlPhrases[i]) == true){
      hasSQLString = true;
    }
  }
  if(hasSQLChar == true || hasSQLString == true){
      hasSQL = true;
  }
  return hasSQL;
}



//=============================================================================
//                                  cssInject()
//  Function to check if cross-site scripting has been injected into the user's
//  input. Checks against cssPhrases array. Returns boolean (false if no CSS
//  injection, true if injected).
//
//                            Parameters: data (String)
//
//                              Returns: hasCss (Boolean)
// 
//=============================================================================
function cssInject(data) {
  var hasCSS = false;
  for(let i=0; i<cssPhrases.length; i++){
    if(data.toUpperCase().includes(cssPhrases[i]) == true){
      hasCSS = true;
    }
  }
  return hasCSS;
}



//=============================================================================
//                                SanitiseInput()
//  Function to check the sanctity of data input from the user. Passes the data
//  through the SQL injection and Cross Site Scripting test functions to check
//  if clean of both. If neither, clean = true, if SQL or CSS injected clean =
//  false.
//
//                           Parameters: data (String)
//
//                            Returns: clean (Boolean)
// 
//=============================================================================
function sanitiseInput(data){
  var clean = true;
  // Checks if SQL injected
  if(sqlInject(data) === true){
    // Logs Injection to Console so Backend Admin can Monitor
    console.log("SQL INJECTION DETECTED ON INPUT: " + data);
    clean = false;
  }
  // Checks if Cross-Site-Scripting Injected
  if(cssInject(data) === true){
    // Logs Injection to Console so Backend Admin can Monitor
    console.log("CROSS-SITE-SCRIPTING DETECTED ON INPUT: " + data);
    clean = false;
  }
  // Returns cleanliness rating
  return clean;
}



//=============================================================================
//                                post(/register)
//  Function to handle registration post requests. CORS whitelisting prevents
//  requests from external sources (only allows frontend address).
//
//                        Parameters: Username, Password
//
//                              Returns: N/A
// 
//=============================================================================
app.post("/register", (req, res) => {
  res.set('Access-Control-Allow-Origin', FRONTEND_ADDRESS); 
  const username = req.body.username;
  const password = req.body.password;

  if(sanitiseInput(username) === true && sanitiseInput(password)){
    var passwordSalt = generatePassword(password);
    var hashedPassword = passwordSalt[0];
    var salt = passwordSalt[1];

    db.query(
      "INSERT INTO Staff (Username, Password, Salt, User_Privileges, Is_Active) VALUES (?, ?, ?, 0, 0)",
      [username, hashedPassword, salt],
      (err, result) => {
        if (err) {
          console.log(err);
          res.send({ err: err });
        }
        //console.log(result);
      }
      );

      var id = -1;
      db.query(
        "SELECT Staff_ID from Staff WHERE Username = ?",
        [username],
        (err, result) => {
          if (err) {
            console.log(err);
            res.send({ err: err });
          }
        //console.log(result);
        id = result[0].Staff_ID;
        console.log(id);
        if(id === "-1"){
          console.log("No ID");
          res.send("Error");
        } else {
          var sessionid = generateSessionID();
          sessions.push([sessionid, id, 0]);
          console.log("New User Registered");
          console.log("Current Sessions");
          console.log(sessions);
          res.send(sessionid);
        }
      }
    );
  } else{
    res.send("SQL/CSS Injection on Input")
  }  
});



//=============================================================================
//                                post(/login)
//  Function to handle login post requests.
//
//  CORS whitelisting prevents requests from external sources
//  (only allows frontend address).
//
//                        Parameters: Username, Password
//
//                              Returns: N/A
// 
//=============================================================================
app.post("/login", (req, res) => {
  res.set('Access-Control-Allow-Origin', FRONTEND_ADDRESS); 
  const username = req.body.username;
  const password = req.body.password;
  if(sanitiseInput(username) === true && sanitiseInput(password)){
    var getSalt = "";
    db.query(
      "SELECT Salt from Staff WHERE Username = ?",
      [username],
      async (err, result) => {
        if (err) {
          console.log(err);
          res.send({ err: err });
        } else {
          getSalt = result;
          console.log(getSalt);
          if(getSalt.length === 0){
            res.send("Error");
            return null;
          } else {
            getSalt = getSalt[0].Salt;
          }
          
          ///
          var correct = false;
          // Adds the salt to the password
          var saltedPassword = addSalt(password, getSalt);
          console.log("salted password");
          console.log(saltedPassword);

          var correctPassword = "";
          console.log("Username: " + username + " Salt: " + getSalt)

          db.query(
            "SELECT password FROM staff WHERE username = ?;",
            [username],
            (err, result) => {
              if (err) {
                console.log(err);
              }
          //console.log(result);
          correctPassword = result[0].password;
          //console.log("Correct Password")
          //console.log(correctPassword)
          // Runs through every possible pepper
          for(let i=0; i<allChars.length; i++){
            var improvedPassword = addPepper(saltedPassword, allChars.charAt(i))
            // hashes the salt-pepper password
            improvedPassword = addHash(improvedPassword);
            //console.log(improvedPassword);
            // gets the password from the db
            if(correctPassword === improvedPassword){
              console.log("Found Match")
              correct = true;
              db.query(
                "SELECT Staff_ID, User_Privileges from Staff WHERE Username = ?",
                [username],
                (err, result) => {
                  if (err) {
                    console.log(err);
                    res.send({ err: err });
                  }
                  //console.log(result);
                  id = result;
                  const privilege = id[0].User_Privileges;
                  id = id[0].Staff_ID;
                  console.log(id);
                  console.log("correct " + correct);
                  if(correct === true){
                    console.log("Login Success")
                        if(id === "-1"){
                          console.log("No ID");
                          res.send("Error");
                        } else {
                          var sessionid = generateSessionID();
                          sessions.push([sessionid, id, privilege]);
                          console.log("New User Logged In");
                          console.log("Current Sessions");
                          console.log(sessions);
                          res.send(sessionid);
                        }
                    }
                }
              );

            }
          }
        }
      );
          ///
        }
      })
      

  } else {
    res.send("SQL/CSS Injection on Input")
  }
});

//=============================================================================
//                               post(/logOut)
//  Function to handle requests to log individual user out
//
//  CORS whitelisting prevents requests from external sources
//  (only allows frontend address).
//
//                      Parameters: SessionID (integer)
//
//                               Returns: N/A
// 
//=============================================================================
app.post("/logOut", (req, res) => {
  res.set('Access-Control-Allow-Origin', FRONTEND_ADDRESS); 
  var sessionid = req.body.session;
  var newSessions = [];
  for(let i=0; i<sessions.length; i++){
    if(sessions[i][0] !== sessionid){
      newSessions.push(session[i]);
    }
  }
  sessions = newSessions;
  //console.log("new sessions:");
  //console.log(sessions);
  res.send("Logged Out");
});



//=============================================================================
//                               post(/getStockItems)
//  Function to handle requests to get all stock items.
//
//  CORS whitelisting prevents requests from external sources
//  (only allows frontend address).
//
//                             Parameters: N/A
//
//                    Returns: Array of all product details
// 
//=============================================================================
app.post("/getStockItems", (req, res) => {
  res.set('Access-Control-Allow-Origin', FRONTEND_ADDRESS); 
  getRecommendations()
  var session = req.body.session;
  var id = -1;
  for(let i=0; i<sessions.length; i++){
    if(sessions[i][0] === session){
      id = sessions[i][1]
    }
  }
  if(id === -1){
    res.send([]);
  } else {
  db.query(
    "SELECT Product.SKU, Product.Product_Name, Product.Stock_Qty, Purchase_Orders.Qty, Purchase_Transactions.Delivery_Date FROM Product LEFT JOIN Purchase_Orders ON Purchase_Orders.SKU = Product.SKU LEFT JOIN Purchase_Transactions ON Purchase_Transactions.PTID = Purchase_Orders.PTID;",
    (err, result) => {
      if (err) {
        console.log(err);
        res.send({ err: err });
      }
      //console.log(result);
      res.send(result);
    }
  );}
});



//=============================================================================
//                               post(/getCategory)
//  Function to handle requests to get categories name from category id.
//
//  CORS whitelisting prevents requests from external sources
//  (only allows frontend address).
//
//                          Parameters: Category_ID (integer)
//
//                           Returns: Category_Name (String)
// 
//=============================================================================
app.post("/getCategory", (req, res) => {
  res.set('Access-Control-Allow-Origin', FRONTEND_ADDRESS); 
  const category_id = req.body.category_id;
  db.query(
    "SELECT Category_Name FROM Product_Categories WHERE category_id = ?;",
    [category_id],
    (err, result) => {
      if (err) {
        console.log(err);
        res.send({ err: err });
      }
      //console.log(result);
      res.send(result);
    }
  );
});



//=============================================================================
//                               post(/getCategories)
//  Function to handle requests to get all category names (where not obsolete)
//
//  CORS whitelisting prevents requests from external sources
//  (only allows frontend address).
//
//                                 Parameters: N/A
//
//                         Returns: Category_Names (Array)
// 
//=============================================================================
app.post("/getCategories", (req, res) => {
  res.set('Access-Control-Allow-Origin', FRONTEND_ADDRESS); 
  db.query(
    "SELECT Category_Name FROM Product_Categories WHERE isObsolete = 0;",
    (err, result) => {
      if (err) {
        console.log(err);
        res.send({ err: err });
      }
      //console.log(result);
      res.send(result);
    }
  );
});



//=============================================================================
//                               post(/getSalesSKUs)
//  Function to handle getting Product Names (where not obsolete)
//
//  CORS whitelisting prevents requests from external sources
//  (only allows frontend address).
//
//                                 Parameters: N/A
//
//                         Returns: Product_Names (Array)
// 
//=============================================================================
app.post("/getSalesSKUs", (req, res) => {
  res.set('Access-Control-Allow-Origin', FRONTEND_ADDRESS); 
  db.query(
    "SELECT Product_Name FROM Product WHERE isObsolete = 0;",
    (err, result) => {
      if (err) {
        console.log(err);
        res.send({ err: err });
      }
      //console.log(result);
      res.send(result);
    }
  );
});



//=============================================================================
//                               post(/addProducts)
//  Function to handle requests to add a new product to the system. Creates with
//  no stock level (0), worst ABCXYZ rating (CZ) and obsolete to false.
//
//  CORS whitelisting prevents requests from external sources
//  (only allows frontend address).
//
//  Parameters: Product_Name (String), Product_Category (String),
//  Product_Retail_Price (Integer), Product_Cost_Price (Integer), MOQ (Integer),
//
//                         Returns: Message (String)
// 
//=============================================================================
app.post("/addProducts", (req, res) => {
  res.set('Access-Control-Allow-Origin', FRONTEND_ADDRESS); 
  const product_name = req.body.product_name;
  const product_category = req.body.category;
  const product_retail_price = req.body.retail_price;
  const product_cost_price = req.body.cost_price;
  const moq = req.body.moq;
  const product_stock = 0;
  const recommended = moq;
  var obsolete = 0;
  if (req.body.obsolete.value == false) {
    obsolete = 1;
  }
  console.log(
    product_name,
    product_category,
    product_retail_price,
    product_cost_price,
    moq,
    product_stock,
    abcxyz,
    obsolete
  );
  var category_id = -1;
  db.query(
    "SELECT Category_ID FROM Product_Categories WHERE Category_Name LIKE ?;",
    [product_category],
    (err, result) => {
      console.log("found id: ", result[0].Category_ID);
      category_id = result[0].Category_ID;
      console.log("assigned id: ", category_id);
      if (err) {
        console.log(err);
        res.send({ err: err });
      }
      //console.log(result);
      //res.send(result);
      if (category_id == -1) {
        console.log("error finding category id");
      }

      db.query(
        "INSERT INTO Product (Category_ID, Product_Name, Cost_Price, Retail_Price, Stock_Qty, MOQ, isObsolete, Recommended) VALUES (?, ?, ?, ?, ?, ?, ?, ?);",
        [
          category_id,
          product_name,
          product_cost_price,
          product_retail_price,
          product_stock,
          moq,
          obsolete,
          recommended
        ],
        (err, result) => {
          if (err) {
            console.log("ERROR inserting product into database", err);
            res.send({ err: err });
          }
          console.log(result);
          res.send({ message: "Product Added" });
        }
      );
    }
  );
});



//=============================================================================
//                               post(/getProduct)
//  Function to handle getting all product information from SKU
//
//  CORS whitelisting prevents requests from external sources
//  (only allows frontend address).
//
//                          Parameters:  SKU (Integer)
//
//                           Returns: Product (Array)
// 
//=============================================================================
app.post("/getProduct", (req, res) => {
  res.set('Access-Control-Allow-Origin', FRONTEND_ADDRESS); 
  const sku = req.body.sku;
  if (sku == -1) {
    console.log("Error with sku");
    return "error";
  }
  db.query("SELECT * FROM Product WHERE SKU = ?;", [sku], (err, result) => {
    if (err) {
      console.log(err);
      res.send({ err: err });
    }
    //console.log(result);
    res.send(result);
  });
});



//=============================================================================
//                               post(/addCategory)
//  Function to add a new category to the system.
//
//  CORS whitelisting prevents requests from external sources
//  (only allows frontend address).
//
//                       Parameters: Category_Name (String)
//
//                           Returns: Message (String)
// 
//=============================================================================
app.post("/addCategory", (req, res) => {
  res.set('Access-Control-Allow-Origin', FRONTEND_ADDRESS); 
  const category_name = req.body.category_name;
  console.log(req.body.obsolete);
  var obsolete = 0;
  if (req.body.obsolete.value == false) {
    obsolete = 1;
  }
  console.log(category_name);
  console.log(obsolete);
  db.query(
    "INSERT INTO Product_Categories (Category_Name, isObsolete) VALUES (?, ?);",
    [category_name, obsolete],
    (err, result) => {
      if (err) {
        res.send({ err: err });
      }

      res.send({ message: "Category Added" });
    }
  );
});



//=============================================================================
//                               post(/editProduct)
//  Function to handle editing product information (on already made item)
//
//  CORS whitelisting prevents requests from external sources
//  (only allows frontend address).
//
//  Parameters:  SKU (Integer), Product_Name (String), Category (String),
//  Cost_Price (Integer), Retail_Price (Integer), MOQ (Integer)
//
//                          Returns: Message (String)
// 
//=============================================================================
app.post("/editProduct", (req, res) => {
  res.set('Access-Control-Allow-Origin', FRONTEND_ADDRESS); 
  const sku = req.body.sku;
  const product_name = req.body.product_name;
  const category = req.body.category;
  const cost_price = req.body.cost_price;
  const retail_price = req.body.retail_price;
  const moq = req.body.moq;

  var obsolete = 0;
  if (req.body.obsolete.value == false) {
    obsolete = 1;
  }

  var category_id = -1;

  db.query(
    "SELECT Category_ID FROM Product_Categories WHERE Category_Name LIKE ?;",
    [category],
    (err, result) => {
      category_id = result[0].Category_ID;
      console.log(category_id);
      db.query(
        "UPDATE Product SET Product_Name = ?, Category_ID = ?, Cost_Price = ?, Retail_Price = ?, MOQ = ?, isObsolete = ? WHERE SKU = ?;",
        [
          product_name,
          category_id,
          cost_price,
          retail_price,
          moq,
          obsolete,
          sku,
        ],
        (err, result) => {
          console.log(
            product_name,
            category_id,
            cost_price,
            retail_price,
            moq,
            obsolete,
            sku
          );
          if (err) {
            res.send({ err: err });
            console.log(err);
          }
          res.send({ message: "Product Updated" });
        }
      );
    }
  );
});



//=============================================================================
//                              post(/getPurchaseHistory)
//  Function to handle getting all purchase history from the system
//
//  CORS whitelisting prevents requests from external sources
//  (only allows frontend address).
//
//                               Parameters:  N/A
//
//                         Returns: Purchase History (Array)
// 
//=============================================================================
app.post("/getPurchaseHistory", (req, res) => {
  res.set('Access-Control-Allow-Origin', FRONTEND_ADDRESS);
  var session = req.body.session;
  var id = -1;
  for(let i=0; i<sessions.length; i++){
    if(sessions[i][0] === session){
      if(sessions[i][2] > 0){
        id = sessions[i][1]
      } 
    }
  }
  if(id === -1){
    res.send([]);
  } else {
    getRecommendations()
    db.query(
      "SELECT Purchase_Transactions.PTID, Purchase_Transactions.Order_Date, Purchase_Transactions.Delivery_Date, Staff.Username, SUM(Purchase_Orders.Qty * Product.Cost_Price) AS Value FROM Purchase_Transactions LEFT JOIN Purchase_Orders ON Purchase_Transactions.PTID = Purchase_Orders.PTID LEFT JOIN Staff ON Purchase_Transactions.Staff_ID = Staff.Staff_ID LEFT JOIN Product ON Product.SKU = Purchase_Orders.SKU GROUP BY Purchase_Transactions.PTID;",
      (err, result) => {
        if (err) {
          //console.log(result);
          console.log(err);
          res.send({ err: err });
        }
        console.log(result);
        res.send(result);
      }
    );
  }
});



//=============================================================================
//                             post(/getSalesHistory)
//  Function to handle getting all sales history information
//
//  CORS whitelisting prevents requests from external sources
//  (only allows frontend address).
//
//                                Parameters:  N/A
//
//                         Returns: Sales History (Array)
// 
//=============================================================================
app.post("/getSalesHistory", (req, res) => {
  res.set('Access-Control-Allow-Origin', FRONTEND_ADDRESS); 
  var session = req.body.session;
  var id = -1;
  for(let i=0; i<sessions.length; i++){
    if(sessions[i][0] === session){
      id = sessions[i][1]
    }
  }
  if(id === -1){
    res.send([]);
  } else {
  getRecommendations()
  db.query(
    "SELECT Sales_Transactions.STID, Sales_Transactions.Transaction_Date, Staff.Username, SUM(Sales_Orders.Qty * Product.Retail_Price) AS Value FROM Sales_Transactions LEFT JOIN Sales_Orders ON Sales_Transactions.STID = Sales_Orders.STID LEFT JOIN Staff ON Sales_Transactions.Staff_ID = Staff.Staff_ID LEFT JOIN Product ON Product.SKU = Sales_Orders.SKU GROUP BY Sales_Transactions.STID;",
    (err, result) => {
      if (err) {
        //console.log(result);
        console.log(err);
        res.send({ err: err });
      }
      //console.log(result);
      res.send(result);
    }
  );
  }
});



//=============================================================================
//                               post(/addSalesOrder)
//  Function to handle adding a new sales transaction
//
//  CORS whitelisting prevents requests from external sources
//  (only allows frontend address).
//
//                           Parameters:  Staff_ID (Integer)
//
//                                  Returns: N/A
// 
//=============================================================================
app.post("/addSalesOrder", (req, res) => {
  res.set('Access-Control-Allow-Origin', FRONTEND_ADDRESS); 
  var session = req.body.session;
  var id = -1;
  for(let i=0; i<sessions.length; i++){
    if(sessions[i][0] === session){
      id = sessions[i][1]
    }
  }
  if(id === -1){
    res.send([]);
  } else {
  db.query(
    "INSERT INTO Sales_Transactions (Staff_ID) VALUES (?);",
    [id],
    (err, result) => {
      if (err) {
        //console.log(result);
        console.log(err);
        res.send({ err: err });
      }
      console.log(result);
      res.send(result);
    }
  );}
});



//=============================================================================
//                               post(/addPurchaseOrder)
//  Function to handle adding a new sales transaction
//
//  CORS whitelisting prevents requests from external sources
//  (only allows frontend address).
//
//                           Parameters:  session (Integer)
//
//                                  Returns: N/A
// 
//=============================================================================
app.post("/addPurchaseOrder", (req, res) => {
  res.set('Access-Control-Allow-Origin', FRONTEND_ADDRESS); 
  var session = req.body.session;
  var id = -1;
  var date = new Date();
  date.setMonth(date.getMonth() + 3);
  for(let i=0; i<sessions.length; i++){
    if(sessions[i][0] === session){
      if(sessions[i][2] > 0){
        id = sessions[i][1]
      } 
    }
  }
  if(id === -1){
    res.send([]);
  } else {
  db.query(
    "INSERT INTO Purchase_Transactions (Staff_ID, Delivery_Date) VALUES (?, ?);",
    [id, date],
    (err, result) => {
      if (err) {
        //console.log(result);
        console.log(err);
        res.send({ err: err });
      }
      console.log(result);
      res.send(result);
    }
  );
  }
});



//=============================================================================
//                               post(/getSalesOrder)
//  Function to handle getting all sales order information from sales transaction
//
//  CORS whitelisting prevents requests from external sources
//  (only allows frontend address).
//
//                     Parameters:  Sales Transaction ID (Integer)
//
//                           Returns: Sales Order (Array)
// 
//=============================================================================
app.post("/getSalesOrder", (req, res) => {
  res.set('Access-Control-Allow-Origin', FRONTEND_ADDRESS); 
  const STID = req.body.STID;
  var session = req.body.session;
  var id = -1;
  for(let i=0; i<sessions.length; i++){
    if(sessions[i][0] === session){
      id = sessions[i][1]
    }
  }
  if(id === -1){
    res.send([]);
  } else {
  db.query(
    "SELECT Sales_Orders.SOID, Sales_Orders.SKU, Product.Product_Name, Sales_Orders.Qty, Product.Retail_Price, Sales_Orders.Discount, SUM(Sales_Orders.Qty * Product.Retail_Price * (100 - Sales_Orders.Discount) /100) AS Value FROM Sales_Orders LEFT JOIN Product ON Sales_Orders.SKU = Product.SKU WHERE STID = ? GROUP BY SKU;",
    [STID],
    (err, result) => {
      if (err) {
        //console.log(result);
        console.log(err);
        res.send({ err: err });
      }
      //console.log("DATA: ", result);
      res.send(result);
    }
  );}
});



//=============================================================================
//                             post(/getPurchaseOrder)
//  Function to handle getting all purchase order information from purchase
//  transaction
//
//  CORS whitelisting prevents requests from external sources
//  (only allows frontend address).
//
//                  Parameters:  Purchase Transaction ID (Integer)
//
//                        Returns: Purchase Order (Array)
// 
//=============================================================================
app.post("/getPurchaseOrder", (req, res) => {
  res.set('Access-Control-Allow-Origin', FRONTEND_ADDRESS); 
  const PTID = req.body.PTID;
  var session = req.body.session;
  var id = -1;
  for(let i=0; i<sessions.length; i++){
    if(sessions[i][0] === session){
      if(sessions[i][2] > 0){
        id = sessions[i][1]
      } 
    }
  }
  if(id === -1){
    res.send([]);
  } else {
  db.query(
    "SELECT Purchase_Orders.POID, Purchase_Orders.SKU, Product.Product_Name, Purchase_Orders.Qty, Product.Cost_Price, SUM(Purchase_Orders.Qty * Product.Cost_Price) AS Value FROM Purchase_Orders LEFT JOIN Product ON Purchase_Orders.SKU = Product.SKU WHERE PTID = ? GROUP BY SKU;",
    [PTID],
    (err, result) => {
      if (err) {
        //console.log(result);
        console.log(err);
        res.send({ err: err });
      }
      //console.log("DATA: ", result);
      res.send(result);
    }
  );
}
});




//=============================================================================
//                             post(/getPurchaseRecommendations)
//  Function to handle getting all purchase order recommendations from product
//
//  CORS whitelisting prevents requests from external sources
//  (only allows frontend address).
//
//                  Parameters:  Purchase Transaction ID (Integer)
//
//                        Returns: Purchase Order (Array)
// 
//=============================================================================
app.post("/getPurchaseRecommendations", (req, res) => {
  res.set('Access-Control-Allow-Origin', FRONTEND_ADDRESS);
  var session = req.body.session;
  var id = -1;
  for(let i=0; i<sessions.length; i++){
    if(sessions[i][0] === session){
      if(sessions[i][2] > 0){
        id = sessions[i][1]
      } 
    }
  }
  if(id === -1){
    res.send([]);
  } else {
  db.query(
    "SELECT SKU, Product_Name, MOQ, Recommended FROM Product WHERE isObsolete = 0;",
    (err, result) => {
      if (err) {
        //console.log(result);
        console.log(err);
        res.send({ err: err });
      }
      //console.log("DATA: ", result);
      res.send(result);
    }
  );}
});



//=============================================================================
//                               post(/addSalesOrderItem)
//  Function to handle adding an item to a sales order
//
//  CORS whitelisting prevents requests from external sources
//  (only allows frontend address).
//
//  Parameters: Product_Name (String), STID (Integer), Qty (Integer), Discount
//  (Integer)
//
//                                    Returns: N/A
// 
//=============================================================================
app.post("/addSalesOrderItem", (req, res) => {
  res.set('Access-Control-Allow-Origin', FRONTEND_ADDRESS); 
  const product_name = req.body.product_name;
  const STID = req.body.STID;
  const Qty = req.body.quantity;
  const Discount = req.body.discount;
  var session = req.body.session;
  var id = -1;
  for(let i=0; i<sessions.length; i++){
    if(sessions[i][0] === session){
      id = sessions[i][1]
    }
  }
  if(id === -1){
    res.send([]);
  } else {
  db.query(
    "SELECT SKU FROM Product WHERE Product_Name LIKE ?;",
    [product_name],
    (err, result) => {
      if (err) {
        //console.log(result);
        console.log(err);
        res.send({ err: err });
      }
      const SKU = result[0].SKU;
      db.query(
        "INSERT INTO Sales_Orders (STID, SKU, Qty, Discount) VALUES (?, ?, ?, ?);",
        [STID, SKU, Qty, Discount],
        (err, result) => {
          if (err) {
            //console.log(result);
            console.log(err);
            res.send({ err: err });
          }
          //console.log(result);
          res.send(result);
        }
      );
    }
  );}
});



//=============================================================================
//                             post(/addPurchaseOrderItem)
//  Function to handle adding an item to a purchase order
//
//  CORS whitelisting prevents requests from external sources
//  (only allows frontend address).
//
//  Parameters: Product_Name (String), PTID (Integer), Qty (Integer)
//
//                                    Returns: N/A
// 
//=============================================================================
app.post("/addPurchaseOrderItem", (req, res) => {
  res.set('Access-Control-Allow-Origin', FRONTEND_ADDRESS); 
  const product_name = req.body.product_name;
  const PTID = req.body.PTID;
  const Qty = req.body.quantity;
  var session = req.body.session;
  var id = -1;
  for(let i=0; i<sessions.length; i++){
    if(sessions[i][0] === session){
      if(sessions[i][2] > 0){
        id = sessions[i][1]
      } 
    }
  }
  if(id === -1){
    res.send([]);
  } else {
  db.query(
    "SELECT SKU FROM Product WHERE Product_Name = ?;",
    [product_name],
    (err, result) => {
      if (err) {
        //console.log(result);
        console.log(err);
        res.send({ err: err });
      }
      const SKU = result[0].SKU;
      db.query(
        "INSERT INTO Purchase_Orders (PTID, SKU, Qty) VALUES (?, ?, ?);",
        [PTID, SKU, Qty],
        (err, result) => {
          if (err) {
            //console.log(result);
            console.log(err);
            res.send({ err: err });
          }
          //console.log(result);
          res.send(result);
        }
      );
    }
  );}
});



//=============================================================================
//                               post(/getProductsFromOrder)
//  Function to handle getting product from Sales Order
//
//  CORS whitelisting prevents requests from external sources
//  (only allows frontend address).
//
//                          Parameters:  SKU (Integer), STID (Integer)
//
//                           Returns: Products (Array)
// 
//=============================================================================
app.post("/getProductsFromOrder", (req, res) => {
  res.set('Access-Control-Allow-Origin', FRONTEND_ADDRESS); 
  const SKU = req.body.sku;
  const STID = req.body.stid;
  var session = req.body.session;
  var id = -1;
  for(let i=0; i<sessions.length; i++){
    if(sessions[i][0] === session){
      id = sessions[i][1]
    }
  }
  if(id === -1){
    res.send([]);
  } else {
  if (SKU == -1) {
    console.log("Error with sku");
    return "error";
  }
  db.query(
    "SELECT * FROM Sales_Orders LEFT JOIN Product ON Sales_Orders.SKU = Product.SKU WHERE Sales_Orders.SKU = ? AND Sales_Orders.STID = ?;",
    [SKU, STID],
    (err, result) => {
      if (err) {
        console.log(err);
        res.send({ err: err });
      }
      //console.log(result);
      res.send(result);
    }
  );}
});



//=============================================================================
//                               post(/getProductsFromPOrder)
//  Function to handle getting product from Purchase Order
//
//  CORS whitelisting prevents requests from external sources
//  (only allows frontend address).
//
//                          Parameters:  SKU (Integer), STID (Integer)
//
//                           Returns: Products (Array)
// 
//=============================================================================
app.post("/getProductsFromPOrder", (req, res) => {
  res.set('Access-Control-Allow-Origin', FRONTEND_ADDRESS); 
  const SKU = req.body.sku;
  const PTID = req.body.PTID;
  var session = req.body.session;
  var id = -1;
  for(let i=0; i<sessions.length; i++){
    if(sessions[i][0] === session){
      if(sessions[i][2] > 0){
        id = sessions[i][1]
      } 
    }
  }
  if(id === -1){
    res.send([]);
  } else {
  if (SKU == -1) {
    console.log("Error with sku");
    return "error";
  }
  db.query(
    "SELECT * FROM Purchase_Orders LEFT JOIN Product ON Purchase_Orders.SKU = Product.SKU WHERE Purchase_Orders.SKU = ? AND Purchase_Orders.PTID = ?;",
    [SKU, PTID],
    (err, result) => {
      if (err) {
        console.log(err);
        res.send({ err: err });
      }
      //console.log(result);
      res.send(result);
    }
  );}
});



//=============================================================================
//                               post(/delSalesOrder)
//  Function to handle deleting a sales order from the system using the sales
//  order id (SOID)
//
//  CORS whitelisting prevents requests from external sources
//  (only allows frontend address).
//
//                          Parameters:  SOID (Integer)
//
//                                Returns: N/A
// 
//=============================================================================
app.post("/delSalesOrder", (req, res) => {
  res.set('Access-Control-Allow-Origin', FRONTEND_ADDRESS); 
  const SOID = req.body.SOID;
  var session = req.body.session;
  var id = -1;
  for(let i=0; i<sessions.length; i++){
    if(sessions[i][0] === session){
      id = sessions[i][1]
    }
  }
  if(id === -1){
    res.send([]);
  } else {
  db.query(
    "DELETE FROM Sales_Orders WHERE SOID = ?;",
    [SOID],
    (err, result) => {
      if (err) {
        console.log(err);
        res.send({ err: err });
      }
      console.log(result);
      res.send(result);
    }
  );}
});


//=============================================================================
//                               post(/delPurchaseOrder)
//  Function to handle deleting a purchase order from the system using the
//  purchase order id (POID)
//
//  CORS whitelisting prevents requests from external sources
//  (only allows frontend address).
//
//                          Parameters:  POID (Integer)
//
//                                Returns: N/A
// 
//=============================================================================
app.post("/delPurchaseOrder", (req, res) => {
  res.set('Access-Control-Allow-Origin', FRONTEND_ADDRESS); 
  const POID = req.body.POID;
  var session = req.body.session;
  var id = -1;
  for(let i=0; i<sessions.length; i++){
    if(sessions[i][0] === session){
      if(sessions[i][2] > 0){
        id = sessions[i][1]
      } 
    }
  }
  if(id === -1){
    res.send([]);
  } else {
  db.query(
    "DELETE FROM Purchase_Orders WHERE POID = ?;",
    [POID],
    (err, result) => {
      if (err) {
        console.log(err);
        res.send({ err: err });
      }
      console.log(result);
      res.send(result);
    }
  );}
});



//=============================================================================
//                               post(/getSalesOrders)
//  Function to handle getting all sales order information
//
//  CORS whitelisting prevents requests from external sources
//  (only allows frontend address).
//
//                                Parameters:  N/A
//
//                          Returns: Sales Orders (Array)
// 
//=============================================================================
app.post("/getSalesOrders", (req, res) => {
  res.set('Access-Control-Allow-Origin', FRONTEND_ADDRESS); 
  db.query(
    "SELECT SOID, Sales_Orders.SKU, Product_Name, Qty, Retail_Price, Discount, SUM(Qty * Retail_Price * (100-Discount) / 100) As Value FROM Sales_Orders LEFT JOIN Product ON Sales_Orders.SKU = Product.SKU GROUP BY SOID;",
    (err, result) => {
      if (err) {
        //console.log(result);
        console.log(err);
        res.send({ err: err });
      }
      //console.log("DATA: ", result);
      console.log(result);
      res.send(result);
    }
  );
});



//=============================================================================
//                               post(/getPurchaseOrders)
//  Function to handle getting all purchase order information
//
//  CORS whitelisting prevents requests from external sources
//  (only allows frontend address).
//
//                                Parameters:  N/A
//
//                          Returns: Sales Orders (Array)
// 
//=============================================================================
app.post("/getPurchaseOrders", (req, res) => {
  res.set('Access-Control-Allow-Origin', FRONTEND_ADDRESS); 
  db.query(
    "SELECT POID, Purchase_Orders.SKU, SUM(Qty * Cost_Price) As Value FROM Purchase_Orders LEFT JOIN Product ON Purchase_Orders.SKU = Product.SKU GROUP BY POID;",
    (err, result) => {
      if (err) {
        //console.log(result);
        console.log(err);
        res.send({ err: err });
      }
      //console.log("DATA: ", result);
      console.log(result);
      res.send(result);
    }
  );
});



//=============================================================================
//                               post(/getStaffList)
//  Function to handle getting all staff information
//
//  CORS whitelisting prevents requests from external sources
//  (only allows frontend address).
//
//                                Parameters:  N/A
//
//                           Returns: Staff List (Array)
// 
//=============================================================================
app.post("/getStaffList", (req, res) => {
  res.set('Access-Control-Allow-Origin', FRONTEND_ADDRESS); 
  var session = req.body.session;
  var id = -1;
  for(let i=0; i<sessions.length; i++){
    if(sessions[i][0] === session){
      if(sessions[i][2] > 1){
        id = sessions[i][1]
      } 
    }
  }
  if(id === -1){
    res.send([]);
  } else {
  db.query(
    "SELECT Staff_ID, Username, User_Privileges, Is_Active FROM Staff",
    (err, result) => {
      if (err) {
        console.log(err);
        res.send({ err: err });
      }
      console.log(result);
      res.send(result);
    }
  );}
});



//=============================================================================
//                               post(/setStaffPurchasing)
//  Function to handle setting a single Staff to have purchasing permission
//
//  CORS whitelisting prevents requests from external sources
//  (only allows frontend address).
//
//                          Parameters:  Staff_ID (Integer)
//
//                                  Returns: N/A
// 
//=============================================================================
app.post("/setStaffPurchasing", (req, res) => {
  res.set('Access-Control-Allow-Origin', FRONTEND_ADDRESS); 
  const Staff_ID = req.body.Staff_ID;
  db.query("UPDATE Staff SET User_Privileges = 1 WHERE Staff_ID = ?;", [Staff_ID], (err, result) => {
    if (err) {
      console.log(err);
      res.send({ err: err });
    }
    console.log(result);
    res.send(result);
  });
});



//=============================================================================
//                               post(/setStaffSales)
//  Function to handle setting a single Staff to have sales permission
//
//  CORS whitelisting prevents requests from external sources
//  (only allows frontend address).
//
//                          Parameters:  Staff_ID (Integer)
//
//                                  Returns: N/A
// 
//=============================================================================
app.post("/setStaffSales", (req, res) => {
  res.set('Access-Control-Allow-Origin', FRONTEND_ADDRESS); 
  const Staff_ID = req.body.Staff_ID;
  db.query("UPDATE Staff SET User_Privileges = 0 WHERE Staff_ID = ?;", [Staff_ID], (err, result) => {
    if (err) {
      console.log(err);
      res.send({ err: err });
    }
    console.log(result);
    res.send(result);
  });
});



//=============================================================================
//                               post(/setStaffAdmin)
//  Function to handle setting a single Staff to have Admin permission
//
//  CORS whitelisting prevents requests from external sources
//  (only allows frontend address).
//
//                          Parameters:  Staff_ID (Integer)
//
//                                  Returns: N/A
// 
//=============================================================================
app.post("/setStaffAdmin", (req, res) => {
  res.set('Access-Control-Allow-Origin', FRONTEND_ADDRESS); 
  const Staff_ID = req.body.Staff_ID;
  db.query("UPDATE Staff SET User_Privileges = 2 WHERE Staff_ID = ?;", [Staff_ID], (err, result) => {
    if (err) {
      console.log(err);
      res.send({ err: err });
    }
    console.log(result);
    res.send(result);
  });
});



//=============================================================================
//                               post(/setStaffActive)
//  Function to handle setting a single Staff be an active account
//
//  CORS whitelisting prevents requests from external sources
//  (only allows frontend address).
//
//                          Parameters:  Staff_ID (Integer)
//
//                                  Returns: N/A
// 
//=============================================================================
app.post("/setStaffActive", (req, res) => {
  res.set('Access-Control-Allow-Origin', FRONTEND_ADDRESS); 
  const Staff_ID = req.body.Staff_ID;
  db.query("UPDATE Staff SET Is_Active = 1 WHERE Staff_ID = ?;", [Staff_ID], (err, result) => {
    if (err) {
      console.log(err);
      res.send({ err: err });
    }
    console.log(result);
    res.send(result);
  });
});



//=============================================================================
//                               post(/setStaffDeactive)
//  Function to handle setting a single Staff to being deactivated
//
//  CORS whitelisting prevents requests from external sources
//  (only allows frontend address).
//
//                          Parameters:  Staff_ID (Integer)
//
//                                  Returns: N/A
// 
//=============================================================================
app.post("/setStaffDeactive", (req, res) => {
  res.set('Access-Control-Allow-Origin', FRONTEND_ADDRESS); 
  const Staff_ID = req.body.Staff_ID;
  db.query("UPDATE Staff SET Is_Active = 0 WHERE Staff_ID = ?;", [Staff_ID], (err, result) => {
    if (err) {
      console.log(err);
      res.send({ err: err });
    }
    //console.log(result);
    console.log("Deactivated");
    res.send(result);
  });
});



//=============================================================================
//                               post(/getStaffPrivilege)
//  Function to handle getting the privilege level of the staff member
//
//  CORS whitelisting prevents requests from external sources
//  (only allows frontend address).
//
//                          Parameters:  Staff_ID (Integer)
//
//                         Returns: User_Privileges (Integer)
// 
//=============================================================================
app.post("/getStaffPrivilege", (req, res) => {
  res.set('Access-Control-Allow-Origin', FRONTEND_ADDRESS); 
  const Staff_ID = req.body.Staff_ID;
  db.query("SELECT User_Privileges FROM Staff WHERE Staff_ID = ?;", [Staff_ID], (err, result) => {
    if (err) {
      console.log(err);
      res.send({ err: err });
    }
    console.log(result);
    res.send(result);
  });
});



//=============================================================================
//                                  getRecommendations()
//  Function to handle making purchase recommendations in the ABCXYZ format
//
//  CORS whitelisting prevents requests from external sources
//  (only allows frontend address).
//
//                             Parameters:  N/A
//
//                      Returns: Product Information (Array)
// 
//=============================================================================
function getRecommendations(){
  //https://stackoverflow.com/questions/21131224/sorting-json-object-based-on-attribute
  function sortByKey(array, key) {
    return array.sort(function(a, b) {
      var x = a[key];
      var y = b[key];
      return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
  }
  db.query("SELECT Sales_Orders.SKU, (Sales_Orders.Qty) AS SQTY, COUNT(Sales_Orders.SKU) AS Tally, Product.Cost_Price, Product.MOQ FROM Sales_Orders LEFT JOIN Sales_Transactions ON Sales_Orders.STID = Sales_Transactions.STID RIGHT JOIN Product ON Sales_Orders.SKU = Product.SKU WHERE Sales_Transactions.Transaction_Date >= curdate() - interval 1 year GROUP BY Sales_Orders.SKU;", (err, result) => {
    if (err) {
      console.log(err);
      result = "";
    }

    var products = []
    for(let i = 0; i<result.length; i++){
      var inProducts = false;
      var pos = 0;
      for(let j = 0; j<products.length; j++){
        if(result[i].SKU === products[j].SKU){
          inProducts= true;
          pos = j;
        }
      }
      if (inProducts === false){
        products.push(result[i])
      } else {
        products[pos].SQTY += result[i].SQTY;
        products[pos].Tally = result[i].Tally;
        products[pos].Cost_Price = result[i].Cost_Price;
        products[pos].MOQ = result[i].MOQ;
      }
    }
    ABC = sortByKey(products, 'SQTY');
    for(let i =0; i<ABC.length; i++){
      if(i< Math.floor(ABC.length*0.2)){
        ABC[i].ABCXYZ = "A"
      }
      if(i< Math.floor(ABC.length*0.5) && i >= Math.floor(ABC.length*0.2)){
        ABC[i].ABCXYZ = "B"
      }
      if(i >= Math.floor(ABC.length*0.5)){
        ABC[i].ABCXYZ = "C"
      }
    }

    XYZ = sortByKey(ABC, 'Tally');
    XYZ = XYZ.reverse();
    for(let i =0; i<XYZ.length; i++){
      if(i< Math.floor(XYZ.length*0.2)){
        XYZ[i].ABCXYZ += "X"
      }
      if(i>= Math.floor(XYZ.length*0.2) && i < Math.floor(XYZ.length*0.5)){
        XYZ[i].ABCXYZ += "Y"
      }
      if(i >= Math.floor(XYZ.length*0.5)){
        XYZ[i].ABCXYZ += "Z"
      }
    }
  
    //console.log(XYZ);

    db.query("SELECT SUM(Cost_Price * Qty) AS Total FROM Purchase_Orders LEFT JOIN Product ON Purchase_Orders.SKU = Product.SKU GROUP BY Purchase_Orders.POID;", (err, result) => {
      if (err) {
        console.log(err);
        result = "";
      }
      var budget = 0;
      var ptids = [];
      for(let k=0; k<result.length; k++){
        budget += result[k].Total;
        if(ptids.includes(result[k].PTID) === false){
          ptids.push(result[k].PTID)
        }
      }
      budget = budget/ptids.length;
      budget = Math.floor(budget);
      //console.log(budget);

      var recommendations = [];

      for(let n=0; n<XYZ.length; n++){
        if(XYZ[n].ABCXYZ === "AX"){
          XYZ[n].Budget = 5;
        }
        if(XYZ[n].ABCXYZ === "AY" || XYZ[n].ABCXYZ === "BX"){
          XYZ[n].Budget = 4;
        }
        if(XYZ[n].ABCXYZ === "AZ" || XYZ[n].ABCXYZ === "BY" || XYZ[n].ABCXYZ === "CX"){
          XYZ[n].Budget = 3;
        }
        if(XYZ[n].ABCXYZ === "BZ" || XYZ[n].ABCXYZ === "CY"){
          XYZ[n].Budget = 2;
        }
        if(XYZ[n].ABCXYZ === "CZ"){
          XYZ[n].Budget = 1;
        }
      }
      XYZ = sortByKey(XYZ, 'Budget');
      XYZ.reverse();
      //console.log(XYZ);

      for(let o = 0; o < XYZ.length; o++){
        var quantity = XYZ[o].Budget * XYZ[o].MOQ;
        recommendations.push([XYZ[o].SKU, quantity]);
        budget -= (quantity * XYZ[o].Cost_Price);
        if(budget <=0){
          break;
        }
      }
      //console.log(recommendations);
      //console.log(budget);
      for(p = 0; p<recommendations.length; p++){
        db.query("UPDATE Product SET Recommended = ? WHERE SKU = ?;", [recommendations[p][1], recommendations[p][0]], (err, result) => {
          if (err) {
            console.log(err);
          }
        });
      }
      console.log("Recommendations Updated");
      return true;
    });
  });
}



//=============================================================================
//                                     Listener
//  
//  System runs backend server and listens on port (default 3001). When testing
//  disabled, please enable databaseCreation() function as this will ensure the
//  MySQL db is running and all tables exist as required for the system.
//
//=============================================================================
app.listen(THIS_PORT, () => {
  // Checks to see if database exists - if not, creates it.
  //databaseCreation();
  getRecommendations();
  console.log("Running Backend Server on port: " + THIS_PORT);
});


//=============================================================================
//                                    Exports
//
//        Module exports functions for use in the testing file (test.js)
// 
//=============================================================================
module.exports = {
  allChars,
  databaseCreation,
  generateSalt,
  generatePepper,
  generatePassword,
  addSalt,
  addPepper,
  addHash,
  sqlChars,
  sqlPhrases,
  sqlInject,
  cssPhrases,
  cssInject,
  getRecommendations
}
