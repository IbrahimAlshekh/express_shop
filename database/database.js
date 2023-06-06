const sqlite3 = require("sqlite3").verbose();
const Models = require("../models");

const db = (model = "Unknown") => {
  return new sqlite3.Database("./db.sqlite3", (err) => {
    if (err) {
      console.log(model + ": Error connecting to the database.");
    }
    console.log(model + ": Connected to the database.");
    return db;
  });
};

const instantiateDB = () => {
  new Models.UserModel().createTable();
  new Models.ProductModel().createTable();
  new Models.OrderModel().createTable();
  new Models.CartModel().createTable();
};

module.exports = {
  db,
  instantiateDB,
};
