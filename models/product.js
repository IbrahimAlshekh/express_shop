class Product {
    constructor() {
        console.log('Product model')
        this.db = require('./database').db();
        this.createTable();
    }

    createTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS products
            (
                id    INTEGER PRIMARY KEY AUTOINCREMENT,
                name  TEXT,
                price INTEGER
            )
        `;
        this.db.run(sql);
        this.db.close();
    }
}

module.exports = Product;