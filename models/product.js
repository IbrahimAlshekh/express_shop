class Product {
    constructor() {
        this.db = require('../database/database').db();
    }

    createTable() {
        console.log('Creating product table...')
        const productsTableSql = `
            CREATE TABLE IF NOT EXISTS "products"
            (
                "id"          int,
                "name"        string,
                "description" string,
                "price"       float,
                "thumnail"    string
            );
        `;
        const productImagesTableSql = `
            CREATE TABLE IF NOT EXISTS "product_images"
            (
                "id"         int,
                "name"       string,
                "image"      string,
                "product_id" int,
                FOREIGN KEY("product_id") REFERENCES products("id")
            );
        `;
        this.db.run(productsTableSql);
        this.db.run(productImagesTableSql);
        this.db.close();
    }
}

module.exports = Product;