class CartModel {
  constructor() {
    this.open();
  }

  open() {
    if (!this.db || (this.db && !this.db.open)) {
      this.db = require("../database/database").db("CartModel");
    }
  }

  close() {
    this.db.close((err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Cart Model: Database connection closed.");
      }
    });
  }

  finalize(stmt, close = true) {
    stmt.finalize((err) => {
      if (err) {
        console.log(err);
      }
      if (close) {
        this.close();
      }
    });
  }

  createTable() {
    this.db.serialize(() => {
      const cartsTableStatement = this.db.prepare(`
            CREATE TABLE IF NOT EXISTS "carts"
            (
                "id"         INTEGER PRIMARY KEY AUTOINCREMENT,
                "user_id" int,
                FOREIGN KEY ("user_id") REFERENCES users ("id")
            );
        `);
      cartsTableStatement.run((err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("carts table created successfully.");
        }
      });

      this.finalize(cartsTableStatement, false);

      const cartItemsTableSql = this.db.prepare(`
            CREATE TABLE IF NOT EXISTS "cart_items"
            (
                "id"         INTEGER PRIMARY KEY AUTOINCREMENT,
                "product_id" int,
                "price"      float,
                "quantity"   int,
                "cart_id"    int,
                FOREIGN KEY ("product_id") REFERENCES products ("id"),
                FOREIGN KEY ("cart_id") REFERENCES carts ("id")
            );
        `);
      cartItemsTableSql.run((err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("cart_items table created successfully.");
        }
      });

      this.finalize(cartItemsTableSql);
    });
  }

  async get(userId) {
    this.open();
    try {
      const statement = this.db.prepare(`
        SELECT *
        FROM carts
        WHERE user_id = ?
      `);
      const cart = await new Promise((resolve, reject) => {
        statement.get(userId, (err, row) => {
          if (err) {
            reject(err);
          }
          resolve(row);
        });
      });

      console.log("cart:", cart);
      if (cart) {
        cart.items = await this.getCartItems(cart.id);
        return cart;
      } else {
        this.finalize(statement);
        return undefined;
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async getCartItems(cartId) {
    this.open();
    const cartItemsStatement = this.db.prepare(`
          SELECT *
          FROM cart_items
          WHERE cart_id = ?
        `);
    const cartItems = await new Promise((resolve, reject) => {
      cartItemsStatement.all(cartId, (err, row) => {
        console.log("cart items:", row);
        if (err) {
          reject(err);
        }
        resolve(row);
      });
    });
    this.finalize(cartItemsStatement, false);
    return cartItems;
  }

  async create(userId) {
    this.open();
    try {
      const insertStmt = this.db.prepare(`
          INSERT INTO carts(user_id)
          VALUES (?)
        `);

      const id = await new Promise((resolve, reject) => {
        insertStmt.run(userId, (err) => {
          if (err) {
            reject(err);
          }
          resolve(this.lastID);
        });
      });

      this.finalize(insertStmt);

      return id;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async createCartItem(cartId, productId, price, quantity) {
    this.open();
    try {
      const insertStmt = this.db.prepare(`
                INSERT INTO cart_items (cart_id, product_id, price, quantity)
                VALUES (?, ?, ?, ?)
            `);

      const id = await new Promise((resolve, reject) => {
        insertStmt.run(cartId, productId, price, quantity, (err) => {
          if (err) {
            reject(err);
          }
          resolve(this.lastID);
        });
      });

      this.finalize(insertStmt);

      return id;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async delete(id) {
    this.open();
    try {
      const statement = this.db.prepare(`
      DELETE
      FROM carts
      WHERE id = ?
  `);
      statement.run(id);

      this.finalize(statement);
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
}

module.exports = CartModel;
