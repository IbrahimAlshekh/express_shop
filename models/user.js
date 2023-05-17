const crypto = require('crypto');

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
                "profile_image" string,
                "is_admin"      boolean
            );
        `;
        const password = crypto.createHash('sha256').update('password').digest('hex');
        const seedUser  = `
            INSERT INTO users
            ( "id", "first_name", "last_name", "username", "email", "password", "profile_image", "is_admin" )
            VALUES
            ( 1, 'John', 'Doe', 'johndoe', 'john@doe.com', '${password}', 'https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50', 1 );
        `;
        this.db.run(sql);
        this.db.run(seedUser);
        this.db.close();
    }
}

module.exports = User;