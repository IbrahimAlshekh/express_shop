class OrderModel {
    constructor() {
        this.db = require('../database/database').db();
    }

    createTable() {
        console.log('Creating order table...')
        const ordersTableStatement = this.db.prepare(`
            CREATE TABLE IF NOT EXISTS "orders"
            (
                "id"  INTEGER   PRIMARY KEY AUTOINCREMENT,
                "user_id"       int,
                "status"        string,
                "paymentmethod" string,
                "total_price"   float,
                "created_at"    datetime,
                FOREIGN KEY("user_id") REFERENCES users("id")
            );
        `);
        ordersTableStatement.run();
        const orderItemsTableStatement = this.db.prepare(`
            CREATE TABLE IF NOT EXISTS "order_items"
            (
                "id"  INTEGER   PRIMARY KEY AUTOINCREMENT,
                "product_id" int,
                "price"      float,
                "quantity"   int,
                "order_id"   int,
                FOREIGN KEY("product_id") REFERENCES products("id"),
                FOREIGN KEY("order_id") REFERENCES orders("id")
            );
        `);
        orderItemsTableStatement.run();
    }
}

module.exports = OrderModel;