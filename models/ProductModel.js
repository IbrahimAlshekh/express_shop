class ProductModel {
    constructor() {
        this.db = require('../database/database').db();
    }

    createTable() {
        console.log('Creating product table...')
        const productsTableStatement = this.db.prepare(`
            CREATE TABLE IF NOT EXISTS "products"
            (
                "id"          int,
                "name"        string,
                "description" string,
                "price"       float,
                "thumnail"    string
            );
        `);

        const productImagesTableStatement = this.db.prepare(`
            CREATE TABLE IF NOT EXISTS "product_images"
            (
                "id"         int,
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
        return []
    }
}

module.exports = ProductModel;