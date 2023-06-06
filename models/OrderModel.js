class OrderModel {
  constructor() {
    this.open();
  }

  open() {
    if (!this.db || (this.db && !this.db.open)) {
      this.db = require("../database/database").db("OrderModel");
    }
  }

  close() {
    this.db.close((err) => {
      if (err) {
        console.log(__filename + ":" + err);
      } else {
        console.log("Order Model: Database connection closed.");
      }
    });
  }

  finalize(stmt, close = true) {
    stmt.finalize((err) => {
      if (err) {
        console.log(__filename + ":" + err);
      }
      if (close) {
        this.close();
      }
    });
  }

  createTable() {
    this.db.serialize(() => {
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

      ordersTableStatement.run((err) => {
        if (err) {
          console.log(__filename + ":" + err);
        } else {
          console.log("orders table created successfully.");
        }
      });

      this.finalize(ordersTableStatement, false);

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
      orderItemsTableStatement.run((err) => {
        if (err) {
          console.log(__filename + ":" + err);
        } else {
          console.log("order_items table created successfully.");
        }
      });

      this.finalize(orderItemsTableStatement);
    });
  }
}

module.exports = OrderModel;
