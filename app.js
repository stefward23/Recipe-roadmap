const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const path = require("path");
// const alert = require("alert")
require("dotenv").config();
const router = express.Router();
const app = express();

app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "assets")));
app.use(express.static(path.join(__dirname, "/")));
app.use(express.static("/"));
app.set("view engine", "ejs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const SERVER_PORT = process.env.SERVER_PORT;

const connection = mysql.createConnection({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
});

connection.connect((err) => {
  if (err) {
    return console.log("err", err);
  }
  console.log("Connected to the database");
});

//Navbar Links redirection

router.get("/home", function (req, res) {
  res.render("home");
});

router.get("/list_of_recipes", function (req, res) {
  const queryStr = `SELECT * FROM recipe ORDER BY id ASC`;

  connection.query(queryStr, (err, result) => {
    if (err) {
      throw err;
    }
    
    res.render("list_of_recipes", { recipe: result });
  }) ;
});

//STARTING

//starting server route and and forming connection to DB on home page
router.get("/", function (req, res) {
  const queryStr = "SELECT * FROM recipe ORDER BY id ASC";

  connection.query(queryStr, (err, result) => {
    if (err) {
      throw err;
    }
    console.log('result', result)
    // res.jsonp({success : true})
   
    res.render("home", { recipe: result });
  });
});

//INSERTING

//Creating/inserting data into mysql database
router.post("/submit", function (req, res) {
  console.log("RECIPE:", req.body.Name);

  const queryStr = `INSERT INTO recipe (Name,Time,Ingredients,Instructions) VALUES ("${req.body.Name}","${req.body.Time}","${req.body.Ingredients}","${req.body.Instructions}")`;

  connection.query(queryStr, (err, result) => {
    console.log("Connected to database");
    if (err) {
      throw err;
    }
    res.writeHead(302, {
      Location: "/",
    });
    res.end();
  });
});

//Getting and Displaying

//Routing to a specific recipe information page with data retrived from database

router.get("/recipe_edit_page/:id", function (req, res) {
  // console.log("id:", req.params.id);
  const queryStr = `SELECT * FROM recipe WHERE id='${req.params.id}';`;

  connection.query(queryStr, (err, result) => {
    if (err) {
      return console.log("err", err);
    }
    res.render("recipe_edit_page", { recipe: result[0] }); //Giving the first input (i.e.) the latest input id
  });
});

// Updating the information of a Recipe

router.post("/update-recipe", function (req, res) {
  // console.log("colour:", req.body.name);
  // const queryStr = `UPDATE recipe SET Time = '${req.body.Time}', Instructions = '${req.body.Instructions}', Ingredients = '${req.body.Ingredients}' WHERE id = '${req.body.id}'`;

  const queryStr = `UPDATE recipe SET Time = '${req.body.Time}' ,Instructions = '${req.body.Instructions}',Ingredients = '${req.body.Ingredients}' WHERE id = '${req.body.id}'`;
  console.log(req.body.Time)
  connection.query(queryStr, (err, result) => {
    if (err) {
      throw err;
    }
    
    res.writeHead(302, {
      Location: "list_of_recipes",
    });
    res.end();
  });
});

// Deleting selected a record from the database

router.post("/delete-recipe", function (req, res) {
  const queryStr = `DELETE FROM recipe WHERE id = ${req.body.id}`; //req.body is requesting something from that html/ejs file and then the "name"

  connection.query(queryStr, (err, result) => {
    if (err) {
      throw err;
    }
    res.writeHead(204);
    res.end();
  });
});

app.use("/", router);

app.listen(SERVER_PORT);
console.log(`Server is running on port ${SERVER_PORT}`);
