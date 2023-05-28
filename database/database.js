const sqlite3 = require('sqlite3');
const Models = require("../models");

const db = () => {
    return new sqlite3.Database('./db.sqlite3', (err) => {
        if (err) {
            console.log('Error connecting to the database.')
        }
        console.log('Connected to the database.')
        return db;
    });
}

const instantiateDB = () => {
    const user = new Models.UserModel();
    const product = new Models.ProductModel();
    const order = new Models.OrderModel();
    const cart = new Models.CartModel();

    user.createTable();
    product.createTable();
    order.createTable();
    cart.createTable();
}

module.exports = {
    db,
    instantiateDB
}

