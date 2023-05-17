const sqlite3 = require('sqlite3');
const {User, Product, Order, Cart} = require("../models");

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
    const user = new User();
    const product = new Product();
    const order = new Order();
    const cart = new Cart();

    user.createTable();
    product.createTable();
    order.createTable();
    cart.createTable();
}

module.exports = {
    db,
    instantiateDB
}

