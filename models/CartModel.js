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
            let crt =  'IVOOOOOOO################';
            const stmt = this.db.prepare(`
                INSERT INTO carts(user_id)
                VALUES (?)
            `);
            stmt.run(userId, (err) => {
                if (err) {
                    console.log(err);
                }
            });

           // await this.db.prepare(`SELECT last_insert_rowid() AS id`).get((err, row) => {
           //      if (err) {
           //          console.log(err);
           //      }
           //      crt = row;
           //  });
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