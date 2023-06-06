class ProductModel {
  constructor() {
    this.open();
  }

  open() {
    if (!this.db || (this.db && !this.db.open)) {
      this.db = require("../database/database").db("ProductModel");
    }
  }

  close() {
    this.db.close((err) => {
      if (err) {
        console.log(__filename + ":" + err);
      } else {
        console.log("Product Model: Database connection closed.");
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
      const productsTableStatement = this.db.prepare(`
        CREATE TABLE IF NOT EXISTS "products"
        (
          "id"          INTEGER PRIMARY KEY AUTOINCREMENT,
          "name"        string,
          "description" string,
          "price"       float,
          "thumbnail"   string
        );
      `);

      productsTableStatement.run((err) => {
        if (err) {
          console.log(__filename + ":" + err);
        } else {
          console.log("products table created successfully.");
        }
      });
      this.finalize(productsTableStatement, false);

      const productImagesTableStatement = this.db.prepare(`
        CREATE TABLE IF NOT EXISTS "product_images"
        (
          "id"         INTEGER PRIMARY KEY AUTOINCREMENT,
          "image"      string,
          "product_id" int,
          FOREIGN KEY ("product_id") REFERENCES products ("id")
        );
      `);
      productImagesTableStatement.run((err) => {
        if (err) {
          console.log(__filename + ":" + err);
        } else {
          console.log("product_images table created successfully.");
        }
      });
      this.finalize(productImagesTableStatement);
    });
  }

  async getAll(withGallery = false) {
    this.open();
    try {
      const stmt = this.db.prepare(`SELECT *
      FROM products`);
      const rows = await new Promise((resolve, reject) => {
        stmt.all((err, rows) => {
          if (err) {
            reject(__filename + ":" + err);
          }
          resolve(rows);
        });
      });

      if (withGallery) {
        for (const row of rows) {
          const images = await this.getProductImages(row.id);
          row.gallery = images;
        }
      }

      this.finalize(stmt);

      return rows;
    } catch (err) {
      console.error(__filename + ": " + err);
      return null;
    }
  }

  async getProductImages(productId) {
    this.open();
    try {
      const stmt = this.db.prepare(`
        SELECT *
        FROM product_images
        WHERE product_id = ?
      `);
      const gallery = await new Promise((resolve, reject) => {
        stmt.all(productId, (err, rows) => {
          if (err) {
            reject(__filename + ":" + err);
          }
          resolve(rows);
        });
      });
      this.finalize(stmt, false);
      return gallery;
    } catch (err) {
      console.error(__filename + ": " + err);
      return null;
    }
  }

  async get(id) {
    this.open();
    try {
      const product = await this.getProductById(id);
      product.gallery = await this.getProductImages(id);
      this.close();
      return product;
    } catch (err) {
      console.error(__filename + ": " + err);
      return null;
    }
  }

  async getProductById(id) {
    this.open();
    try {
      const stmt = this.db.prepare(`
        SELECT *
        FROM products
        WHERE id = ?
      `);
      const product = await new Promise((resolve, reject) => {
        stmt.get(id, (err, row) => {
          if (err) {
            reject(__filename + ":" + err);
          }
          resolve(row);
        });
      });
      this.finalize(stmt, false);
      return product;
    } catch (err) {
      console.error(__filename + ": " + err);
      return null;
    }
  }

  async create(product) {
    this.open();
    try {
      const insertStmt = this.db.prepare(`
        INSERT INTO products(name, description, price, thumbnail)
        VALUES (?, ?, ?, ?)
      `);

      const id = await new Promise((resolve, reject) => {
        insertStmt.run(
          product.name,
          product.description,
          product.price,
          product.thumbnail,
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

  async addGalleryImage(product_id, image) {
    this.open();
    try {
      const insertStmt = this.db.prepare(`
        INSERT INTO product_images(image, product_id)
        VALUES (?, ?)
      `);

      const id = await new Promise((resolve, reject) => {
        insertStmt.run(image, product_id, (err) => {
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

  async update(productId, product) {
    this.open();
    try {
      const stmt = this.db.prepare(`
        UPDATE products
        SET name      = ?,
          description = ?,
          price       = ?,
          thumbnail   = ?
        WHERE id = ?
      `);

      const id = await new Promise((resolve, reject) => {
        stmt.run(
          product.name,
          product.description,
          product.price,
          product.thumbnail,
          productId,
          (err) => {
            if (err) {
              reject(__filename + ":" + err);
            }
            resolve(this.lastID);
          }
        );
      });

      this.finalize(stmt);
      return id;
    } catch (err) {
      console.log(__filename + ":" + err);
      throw err;
    }
  }

  delete(id) {
    this.open();
    try {
      const statement = this.db.prepare(`
        DELETE
        FROM products
        WHERE id = ?
      `);
      statement.run(id);

      this.finalize(statement);
    } catch (err) {
      console.log(__filename + ":" + err);
      throw err;
    }
  }

  async deleteGalleryImage(id) {
    this.open();
    try {
      const statement = this.db.prepare(`
        DELETE
        FROM product_images
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

module.exports = ProductModel;
