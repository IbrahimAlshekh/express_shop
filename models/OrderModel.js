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
    this.db.close(function(err){
      if (err) {
        console.log(__filename + ":" + err);
      } else {
        console.log("Order Model: Database connection closed.");
      }
    });
  }

  finalize(stmt, close = true) {
    stmt.finalize(function(err){
      if (err) {
        console.log(__filename + ":" + err);
      }
    });
  }

  createTable() {
    this.db.serialize(() => {
      const ordersTableStatement = this.db.prepare(`
        CREATE TABLE IF NOT EXISTS "orders"
        (
          "id"  INTEGER   PRIMARY KEY AUTOINCREMENT,
          "number"        string,
          "user_id"       int,
          "status"        string,
          "paymentmethod" string,
          "total_price"   float,
          "created_at"    datetime,
          FOREIGN KEY("user_id") REFERENCES users("id")
        );
      `);

      ordersTableStatement.run(function(err){
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
      orderItemsTableStatement.run(function(err){
        if (err) {
          console.log(__filename + ":" + err);
        } else {
          console.log("order_items table created successfully.");
        }
      });

      this.finalize(orderItemsTableStatement);
    });
  }

  async get(id) {
    try {
      this.open();
      const statement = this.db.prepare(`
        SELECT *
        FROM orders
        WHERE id = ?
      `);
      const order = await new Promise((resolve, reject) => {
        statement.get(id, function(err, row){
          if (err) {
            reject(__filename + ":" + err);
          }
          resolve(row);
        });
      });

      this.finalize(statement);

      if (order) {
        order.items = await this.getOrderItems(order.id);
        return order;
      } else {
        return undefined;
      }
    } catch (err) {
      console.log(__filename + ":" + err);
      throw err;
    }
  }

  async getByUserId(userId) {
    try {
      this.open();
      const stmt = this.db.prepare(`
        SELECT *
        FROM orders
        WHERE user_id = ?
      `);
      const rows = await new Promise((resolve, reject) => {
        stmt.all(userId, function(err, rows){
          if (err) {
            reject(__filename + ":" + err);
          }
          resolve(rows);
        });
      });

      for (const row of rows) {
        row.items = await this.getOrderItems(row.id);
      }

      this.finalize(stmt);

      return rows;
    } catch (err) {
      console.log(__filename + ":" + err);
      throw err;
    }
  }

  async getOrderItems(order_id) {
    try {
      this.open();
      const stmt = this.db.prepare(`
        SELECT *
        FROM order_items
        WHERE order_id = ?
      `);
      const orderItems = await new Promise((resolve, reject) => {
        stmt.all(order_id, function(err, row){
          if (err) {
            reject(__filename + ":" + err);
          }
          resolve(row);
        });
      });
      this.finalize(stmt);
      return orderItems;
    } catch (err) {
      console.log(__filename + ":" + err);
      throw err;
    }
  }

  async create(order) {
    try {
      this.open();
      const insertStmt = this.db.prepare(`
          INSERT INTO orders (number, user_id, status, paymentmethod, total_price, created_at)
          VALUES (?,?, ?, ?, ?, ?)
        `);

      const id = await new Promise((resolve, reject) => {
        insertStmt.run(
          order.number,
          order.user_id,
          order.status,
          order.paymentmethod,
          order.total_price,
          order.created_at,
          function (err) {
            if (err) {
              reject(__filename + ":" + err);
            }
            resolve(this.lastID);
          }
        );
      });

      console.log("Order created with id: " + id);
      for (const orderItem of order.items) {
        orderItem.order_id = id;
        await this.createOrderItem(orderItem);
      }

      this.finalize(insertStmt);

      return id;
    } catch (err) {
      console.log(__filename + ":" + err);
      throw err;
    }
  }

  async createOrderItem(orderItem) {
    this.open();
    try {
      const insertStmt = this.db.prepare(`
        INSERT INTO order_items (order_id, product_id, price, quantity)
        VALUES (?, ?, ?, ?)
      `);

      const id = await new Promise((resolve, reject) => {
        insertStmt.run(
          orderItem.order_id,
          orderItem.product_id,
          orderItem.price,
          orderItem.quantity,
          function(err){
            if (err) {
              reject(__filename + ":" + err);
            }
            resolve(this.lastID);
          }
        );
      });

      this.finalize(insertStmt);

      return id;
    } catch (err) {
      console.log(__filename + ":" + err);
      throw err;
    }
  }

  async deleteOrderItem(orderItem) {
    this.open();
    try {
      const statement = this.db.prepare(`
      DELETE
      FROM order_items
      WHERE order_id = ? and product_id = ?
  `);
      statement.run(orderItem.order_id, orderItem.product_id);

      this.finalize(statement);
    } catch (err) {
      console.log(__filename + ":" + err);
      throw err;
    }
  }

  async delete(id) {
    this.open();
    try {
      const statement = this.db.prepare(`
      DELETE
      FROM orders
      WHERE id = ?
  `);
      statement.run(id);

      this.finalize(statement);
    } catch (err) {
      console.log(__filename + ":" + err);
      throw err;
    }
  }
}

module.exports = OrderModel;
