class CartModel {
    constructor() {
        this.db = require('../database/database').db();
    }

    createTable() {
        console.log('Creating cart table...');
        const cartsTableStatement = this.db.prepare(`
            CREATE TABLE IF NOT EXISTS "carts"
            (
                "id"     int,
                "user_id" int,
                FOREIGN KEY("user_id") REFERENCES users("id")
            );
        `);
        cartsTableStatement.run();
        const cartItemsTableSql = this.db.prepare(`
        CREATE TABLE IF NOT EXISTS "cart_items"
            (
                "id"         int,
                "product_id" int,
                "price"      float,
                "quantity"   int,
                "cart_id"    int,
                FOREIGN KEY("product_id") REFERENCES products("id"),
                FOREIGN KEY("cart_id") REFERENCES carts("id")
            );
        `);
        cartItemsTableSql.run();
    }
}

module.exports = CartModel;