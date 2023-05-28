const crypto = require('crypto');

class UserModel {
    constructor() {
        this.db = require('../database/database').db();
    }

    createTable() {
        console.log('Creating user table...')
        const usesTableStatement = this.db.prepare(`
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
        `);
        usesTableStatement.run();
    }

    getAll() {
        return new Promise((resolve, reject) => {
            const stmt = this.db.prepare(`SELECT *
                                          FROM users`);
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
                FROM users
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

    authenticate(username, password) {
        return new Promise((resolve, reject) => {
            const stmt = this.db.prepare(`
                SELECT *
                FROM users
                WHERE username = ?
                  AND password = ?
            `);
            return stmt.get(username, password, (err, row) => {
                if (err) {
                    reject(err);
                }
                resolve(row);
            });
        });
    }

    create(user) {
        const stmt = this.db.prepare(`
            INSERT INTO users (first_name, last_name, username, email, password, profile_image, is_admin)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        const password = crypto.createHash('sha256').update(user.password).digest('hex');
        stmt.run(user.first_name ?? null, user.last_name ?? null, user.username, user.email, password, user.profile_image ?? null, user.is_admin ?? 0);
    }

    update(user) {
        const stmt = `
            UPDATE users
            SET first_name    = ?,
                last_name     = ?,
                username      = ?,
                email         = ?,
                password      = ?,
                profile_image = ?,
                is_admin      = ?
            WHERE id = ?
        `;
        stmt.run(user.first_name, user.last_name, user.username, user.email, user.password, user.profile_image, user.is_admin, user.id);
    }

    delete(id) {
        const stmt = `
            DELETE
            FROM users
            WHERE id = ?
        `;
        stmt.run(id);
    }
}

module.exports = UserModel;