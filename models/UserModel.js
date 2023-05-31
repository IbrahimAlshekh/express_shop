const crypto = require('crypto');
const e = require("express");
const {getPasswordHash} = require("../lib/utils");

class UserModel {
    constructor() {
        this.db = require('../database/database').db();
    }

    createTable() {
        console.log('Creating user table...')
        const usesTableStatement = this.db.prepare(`
            CREATE TABLE IF NOT EXISTS "users"
            (
                "id"            INTEGER PRIMARY KEY AUTOINCREMENT,
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
                WHERE (username = ? or email = ?)
                  AND password = ?
            `);
            console.log(username, password, getPasswordHash(password), stmt)
            return stmt.get(username ?? null, username ?? null, getPasswordHash(password), (err, row) => {
                if (err) {
                    reject(err);
                }
                console.log('resolve',row)
                resolve(row);
            });
        });
    }

    create(user) {
        const stmt = this.db.prepare(`
            INSERT INTO users (first_name, last_name, username, email, password, profile_image, is_admin)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(user.first_name ?? null, user.last_name ?? null, user.username, user.email, getPasswordHash(user.password), user.profile_image ?? null, user.is_admin ?? 0);
    }

    update(userId, userData) {
        const password = userData.password ? `password = '${getPasswordHash(userData.password)}',` : '';
        const stmt = this.db.prepare(`
            UPDATE users
            SET first_name    = ?,
                last_name     = ?,
                username      = ?,
                email         = ?,
                profile_image = ?,
                ${password} 
                is_admin      = ?
            WHERE id = ?
        `);
        stmt.run(userData.first_name, userData.last_name, userData.username, userData.email, userData.profile_image, userData.is_admin, userId);
    }

    delete(id) {
        const stmt = this.db.prepare(`
            DELETE
            FROM users
            WHERE id = ?
        `);
        stmt.run(id);
    }
}

module.exports = UserModel;