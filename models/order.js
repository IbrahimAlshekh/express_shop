class Order {
    constructor() {
        this.db = require('../database/database').db();
    }

    createTable() {
        console.log('Creating order table...')
        const ordersTableSql = `
            CREATE TABLE IF NOT EXISTS "orders"
            (
                "id"            int,
                "user_id"       int,
                "status"        string,
                "paymentmethod" string,
                "total_price"   float,
                "created_at"    datetime,
                FOREIGN KEY("user_id") REFERENCES users("id")
            );
        `;
        const orderItemsTableSql = `
            CREATE TABLE IF NOT EXISTS "order_items"
            (
                "id"         int,
                "product_id" int,
                "price"      float,
                "quantity"   int,
                "order_id"   int,
                FOREIGN KEY("product_id") REFERENCES products("id"),
                FOREIGN KEY("order_id") REFERENCES orders("id")
            );
        `;

        this.db.run(ordersTableSql);
        this.db.run(orderItemsTableSql);
        this.db.close();
    }
}

module.exports = Order;