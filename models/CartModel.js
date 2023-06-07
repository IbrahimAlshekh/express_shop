const e = require("express");
const logger = require("morgan");

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
        console.log(__filename + ":" + err);
      } else {
        console.log("Cart Model: Database connection closed.");
      }
    });
  }

  finalize(stmt, close = true) {
    stmt.finalize((err) => {
      if (err) {
        console.log(__filename + ":" + err);
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
          console.log(__filename + ":" + err);
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
          console.log(__filename + ":" + err);
        } else {
          console.log("cart_items table created successfully.");
        }
      });

      this.finalize(cartItemsTableSql);
    });
  }

  async get(id) {
    try {
      this.open();
      const statement = this.db.prepare(`
        SELECT *
        FROM carts
        WHERE id = ?
      `);
      const cart = await new Promise((resolve, reject) => {
        statement.get(id, (err, row) => {
          if (err) {
            reject(__filename + ":" + err);
          }
          resolve(row);
        });
      });

      this.finalize(statement);

      if (cart) {
        cart.items = await this.getCartItems(cart.id);
        return cart;
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
      const statement = this.db.prepare(`
        SELECT *
        FROM carts
        WHERE user_id = ?
      `);
      const cart = await new Promise((resolve, reject) => {
        statement.get(userId, (err, row) => {
          if (err) {
            reject(__filename + ":" + err);
          }
          resolve(row);
        });
      });

      if (cart) {
        cart.items = await this.getCartItems(cart.id);
        return cart;
      } else {
        this.finalize(statement);
        return undefined;
      }
    } catch (err) {
      console.log(__filename + ":" + err);
      throw err;
    }
  }

  async getCartItems(cart_id) {
    try {
      this.open();
      const cartItemsStatement = this.db.prepare(`
        SELECT *
        FROM cart_items
        WHERE cart_id = ?
      `);
      const cartItems = await new Promise((resolve, reject) => {
        cartItemsStatement.all(cart_id, (err, row) => {
          if (err) {
            reject(__filename + ":" + err);
          }
          resolve(row);
        });
      });
      this.finalize(cartItemsStatement);
      return cartItems;
    } catch (err) {
      console.log(__filename + ":" + err);
      throw err;
    }
  }

  async create(userId) {
    try {
      this.open();
      const insertStmt = this.db.prepare(`
          INSERT INTO carts(user_id)
          VALUES (?)
        `);

      const id = await new Promise((resolve, reject) => {
        insertStmt.run(userId, (err) => {
          if (err) {
            reject(__filename + ":" + err);
          }
          resolve(this.lastID);
        });
      });

      this.finalize(insertStmt);

      return id;
    } catch (err) {
      console.log(__filename + ":" + err);
      throw err;
    }
  }

  async addItem(cart_id, cartItem) {
    try {
      this.open();
      const cart = await this.get(cart_id);
      if (this.hasItem(cart, cartItem.product_id)) {
        await this.updateCartItem(cartItem);
      } else {
        await this.createCartItem(cartItem);
      }
    } catch (err) {
      console.log(__filename + ":" + err);
      throw err;
    }
  }

  hasItem(cart, product_id) {
    return cart.items.some((item) => item.product_id === product_id);
  }

  async createCartItem(cartItem) {
    this.open();
    try {
      const insertStmt = this.db.prepare(`
                INSERT INTO cart_items (cart_id, product_id, price, quantity)
                VALUES (?, ?, ?, ?)
            `);

      const id = await new Promise((resolve, reject) => {
        insertStmt.run(
          cartItem.cart_id,
          cartItem.product_id,
          cartItem.price,
          cartItem.quantity,
          (err) => {
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

  async updateCartItem(cartItem) {
    this.open();
    try {
      const updateStmt = this.db.prepare(`
        UPDATE cart_items 
        SET quantity = (quantity + ?)
        WHERE cart_id = ? AND product_id = ?
      `);

      await new Promise((resolve, reject) => {
        updateStmt.run(
          cartItem.quantity,
          cartItem.cart_id,
          cartItem.product_id,
          (err) => {
            if (err) {
              reject(__filename + ":" + err);
            }
            resolve(this.lastID);
          }
        );
      });

      this.finalize(updateStmt);
    } catch (err) {
      console.log(__filename + ":" + err);
      throw err;
    }
  }

  async deleteCartItem(cartItem) {
    this.open();
    try {
      const statement = this.db.prepare(`
      DELETE
      FROM cart_items
      WHERE cart_id = ? and product_id = ?
  `);
      statement.run(cartItem.cart_id, cartItem.product_id);

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
      FROM carts
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

module.exports = CartModel;
