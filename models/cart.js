class Cart {
    constructor() {
        this.db = require('../database/database').db();
    }

    createTable() {
        console.log('Creating cart table...');
        const cartsTableSql = `
            CREATE TABLE IF NOT EXISTS "carts"
            (
                "id"     int,
                "user_id" int,
                FOREIGN KEY("user_id") REFERENCES users("id")
            );
        `;
        const cartItemsTableSql = `
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
        `;
        this.db.run(cartsTableSql);
        this.db.run(cartItemsTableSql);
        this.db.close();
    }
}

module.exports = Cart;