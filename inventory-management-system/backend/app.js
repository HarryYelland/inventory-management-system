var express = require("express");
const mysql = require("mysql");
const cors = require("cors");
var app = express();
var fs = require("fs");
const { isObject } = require("util");

app.use(express.json());
app.use(cors());

function generateSalt(){
  var numGen = Math.floor(Math.random() * 126);
  //console.log("num generated " + numGen);
  var salt = String.fromCharCode(numGen);
  //console.log(salt);
  return salt;
}

function getSalt(id){
  var salt = "";
  db.query(
    "SELECT Salt FROM Staff WHERE Staff_ID = ?;",
    [id], 
    (err, result) => {
      if (err) {
        console.log(err);
        res.send({ err: err });
      }
      console.log(result);
      salt = result;
    }
  );
  return salt;
}

function generatePepper(){
  var numGen = Math.floor(Math.random() * 126);
  //console.log("num generated " + numGen);
  var pepper = String.fromCharCode(numGen);
  return pepper;
}

function hash(){}

function checkHash(){}


//list of chars taken from https://www.folkstalk.com/tech/avoid-sql-injection-in-password-field-with-code-examples/
const badChars = [
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
  "?",
  "[",
  "|",
  "\t",
  "\n",
];

// https://www.w3schools.com/sql/sql_ref_keywords.asp
const badPhrases = [
  "SELECT",
  "DELETE",
  "UPDATE",
  "TABLE",
  "CREATE",
  "WHERE",
  "DROP",
  "ORDER",
  "GROUP",
  "JOIN",
]

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


// Function to check if sql has been injected into message
function sqlInject(data) {
  var hasSQL = false;
  var hasSQLChar = false;
  for(let i=0; i<badChars.length; i++){
    if(data.includes(badChars[i])){
      hasSQLChar = true;
    }
  }

  var hasSQLString = false;
  for(let i=0; i<badPhrases.length; i++){
    if(data.toUpperCase().includes(badPhrases[i]) == true){
      hasSQLString = true;
    }
  }
  console.log("hasSQLChar " + hasSQLChar);
  console.log("hasSQLString " + hasSQLString);
  if(hasSQLChar == true || hasSQLString == true){
      hasSQL = true;
  }
  console.log(hasSQL);
  return hasSQL;
}


app.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  console.log(username);
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  console.log(username);
});

app.post("/getStockItems", (req, res) => {
  db.query(
    "SELECT Product.SKU, Product.Product_Name, Product.Stock_Qty, Purchase_Orders.Qty, Purchase_Transactions.Delivery_Date FROM Product LEFT JOIN Purchase_Orders ON Purchase_Orders.SKU = Product.SKU LEFT JOIN Purchase_Transactions ON Purchase_Transactions.PTID = Purchase_Orders.PTID;",
    (err, result) => {
      if (err) {
        console.log(err);
        res.send({ err: err });
      }
      console.log(result);
      res.send(result);
    }
  );
});

app.post("/getCategory", (req, res) => {
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

app.post("/getCategories", (req, res) => {
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

app.post("/getSalesSKUs", (req, res) => {
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

app.post("/addProducts", (req, res) => {
  const product_name = req.body.product_name;
  const product_category = req.body.category;
  const product_retail_price = req.body.retail_price;
  const product_cost_price = req.body.cost_price;
  const moq = req.body.moq;
  const product_stock = 0;
  const abcxyz = "CZ";
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
        "INSERT INTO Product (Category_ID, ABCXYZ, Product_Name, Cost_Price, Retail_Price, Stock_Qty, MOQ, isObsolete) VALUES (?, ?, ?, ?, ?, ?, ?, ?);",
        [
          category_id,
          abcxyz,
          product_name,
          product_cost_price,
          product_retail_price,
          product_stock,
          moq,
          obsolete,
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

app.post("/getProduct", (req, res) => {
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

app.post("/addCategory", (req, res) => {
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

app.post("/editProduct", (req, res) => {
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

app.post("/getPurchaseHistory", (req, res) => {
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
});

app.post("/getSalesHistory", (req, res) => {
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
});

app.post("/addSalesOrder", (req, res) => {
  const staff_ID = req.body.Staff_ID;
  db.query(
    "INSERT INTO Sales_Transactions (Staff_ID) VALUES (?);",
    [staff_ID],
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
});

app.post("/getSalesOrder", (req, res) => {
  const STID = req.body.STID;
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
  );
});

app.post("/addSalesOrderItem", (req, res) => {
  const product_name = req.body.product_name;
  const STID = req.body.STID;
  const Qty = req.body.quantity;
  const Discount = req.body.discount;
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
  );
});

app.post("/getProductsFromOrder", (req, res) => {
  const SKU = req.body.sku;
  const STID = req.body.stid;
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
  );
});

app.post("/delSalesOrder", (req, res) => {
  const SOID = req.body.SOID;
  console.log(SOID);
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
  );
});


app.post("/getSalesOrders", (req, res) => {
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

app.post("/getStaffList", (req, res) => {
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
  );
});

app.post("/setStaffPurchasing", (req, res) => {
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

app.post("/setStaffSales", (req, res) => {
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

app.post("/setStaffAdmin", (req, res) => {
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

app.post("/setStaffActive", (req, res) => {
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

app.post("/setStaffDeactive", (req, res) => {
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

app.post("/getStaffPrivilege", (req, res) => {
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


app.listen(3002, () => {
  console.log("Running server");
});

module.exports = app;
