class ProductModel {
    constructor() {
        this.db = require('../database/database').db();
    }

    createTable() {
        console.log('Creating product table...')
        const productsTableStatement = this.db.prepare(`
            CREATE TABLE IF NOT EXISTS "products"
            (
                "id"  INTEGER   PRIMARY KEY AUTOINCREMENT,
                "name"        string,
                "description" string,
                "price"       float,
                "thumbnail"    string
            );
        `);

        const productImagesTableStatement = this.db.prepare(`
            CREATE TABLE IF NOT EXISTS "product_images"
            (
                "id"  INTEGER   PRIMARY KEY AUTOINCREMENT,
                "name"       string,
                "image"      string,
                "product_id" int,
                FOREIGN KEY("product_id") REFERENCES products("id")
            );
        `);
        productsTableStatement.run();
        productImagesTableStatement.run();
    }
    getAll() {
        return new Promise((resolve, reject) => {
            const stmt = this.db.prepare(`SELECT * FROM products`);
            stmt.all((err, rows) => {
                if (err) {
                    reject(err);
                }
                resolve(rows);
            });
        });
    }

    get(id) {
        return new Promise((resolve, reject) => {
            const stmt = this.db.prepare(`
                SELECT *
                FROM products
                WHERE id = ?
            `);
            return stmt.get(id, (err, row) => {
                if (err) {
                    reject(err);
                }
                resolve(row);
            });
        });
    }

    getWhere(where) {
        return new Promise((resolve, reject) => {
            const stmt = this.db.prepare(`
                SELECT *
                FROM products
                WHERE ${where}
            `);
            return stmt.get((err, row) => {
                if (err) {
                    reject(err);
                }
                resolve(row);
            });
        });
    }

    create(product) {
        return new Promise((resolve, reject) => {
            const stmt = this.db.prepare(`
                INSERT INTO products(name, description, price, thumbnail)
                VALUES (?, ?, ?, ?)
            `);
            stmt.run(product.name, product.description, product.price, product.thumbnail, (err) => {
                if (err) {
                    reject(err);
                }
            });
            resolve();
        });
    }

    update(productId,product) {
        return new Promise((resolve, reject) => {
            const stmt = this.db.prepare(`
                UPDATE products
                SET name = ?,
                    description = ?,
                    price = ?,
                    thumbnail = ?
                WHERE id = ?
            `);
            return stmt.run(product.name, product.description, product.price, product.thumbnail, productId, (err) => {
                if (err) {
                    reject(err);
                }
                resolve();
            });
        });
    }

    delete(id) {
        return new Promise((resolve, reject) => {
            const stmt = this.db.prepare(`
                DELETE FROM products
                WHERE id = ?
            `);
            return stmt.run(id, (err) => {
                if (err) {
                    reject(err);
                }
                resolve();
            });
        });
    }
}

module.exports = ProductModel;