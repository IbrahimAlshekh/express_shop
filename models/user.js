class User {
    constructor() {
        this.db = require('../database/database').db();
    }

    createTable() {
        console.log('Creating user table...')
        const sql = `
            CREATE TABLE IF NOT EXISTS "users"
            (
                "id"            int,
                "first_name"    string,
                "last_name"     string,
                "username"      string,
                "email"         string,
                "password"      string,
                "profile_image" string
            );
        `;
        this.db.run(sql);
        this.db.close();
    }
}

module.exports = User;