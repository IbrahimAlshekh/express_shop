class CartModel {
    constructor() {
        this.db = require('../database/database').db();
    }

    createTable() {
        console.log('Creating cart table...');
        const cartsTableStatement = this.db.prepare(`
            CREATE TABLE IF NOT EXISTS "carts"
            (
                "id"         INTEGER PRIMARY KEY AUTOINCREMENT,
                "user_id" int,
                FOREIGN KEY ("user_id") REFERENCES users ("id")
            );
        `);
        cartsTableStatement.run();
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
        cartItemsTableSql.run();
    }

    get(userId) {
        return new Promise((resolve, reject) => {
            const statement = this.db.prepare(`
                SELECT *
                FROM carts
                WHERE user_id = ?
            `);
            statement.get(userId, (err, row) => {
                if (err) {
                    reject(err);
                }
                if (row) {
                    this.db.prepare(`
                        SELECT *
                        FROM cart_items
                        WHERE cart_id = ?
                    `).all(row?.id, (err, rows) => {
                        if (err) {
                            reject(err);
                        }
                        row.items = rows;
                        resolve(row);
                    })
                }
                resolve(undefined);
            });
        });
    }

    async create(userId) {
        let crt = null;
        const insertStmt = this.db.prepare(`
          INSERT INTO carts(user_id)
          VALUES (?)
        `);
        const result = await insertStmt.run(userId);
        const cartId = result.lastInsertRowid;
        crt = cartId;
        insertStmt.finalize();
        
        this.db.close();

        return crt;
    }

    createCartItem(cartId, productId, price, quantity) {
        return new Promise((resolve, reject) => {
            const statement = this.db.prepare(`
                INSERT INTO cart_items (cart_id, product_id, price, quantity)
                VALUES (?, ?, ?, ?)
            `);
            statement.run(cartId, productId, price, quantity, (err) => {
                if (err) {
                    reject(err);
                }
                resolve();
            });
        });
    }

    delete(id) {
        return new Promise((resolve, reject) => {
            const statement = this.db.prepare(`
                DELETE
                FROM carts
                WHERE id = ?
            `);
            statement.run(id, (err) => {
                if (err) {
                    reject(err);
                }
                resolve();
            });
        });
    }
}

module.exports = CartModel;