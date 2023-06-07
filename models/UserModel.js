const { getPasswordHash } = require("../lib/utils");

class UserModel {
  constructor() {
    this.open();
  }

  open() {
    if (!this.db || (this.db && !this.db.open)) {
      this.db = require("../database/database").db("UserModel");
    }
  }

  close() {
    this.db.close(function(err){
      if (err) {
        console.log(__filename + ":" + err);
      } else {
        console.log("User model: Database connection closed.");
      }
    });
  }

  finalize(stmt, close = true) {
    stmt.finalize(function(err){
      if (err) {
        console.log(__filename + ":" + err);
      }
    });
  }

  createTable() {
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
    usesTableStatement.run(function(err){
      if (err) {
        console.log(__filename + ":" + err);
      } else {
        console.log("users table created successfully.");
      }
    });
    this.finalize(usesTableStatement);
  }

  async getAll() {
    this.open();
    try {
      const stmt = this.db.prepare(`SELECT * FROM users`);
      const users = await new Promise((resolve, reject) => {
        stmt.all(function(err, rows){
          if (err) {
            reject(__filename + ":" + err);
          }
          resolve(rows);
        });
      });

      this.finalize(stmt);

      return users;
    } catch (err) {
      console.error(__filename + ": " + err);
      return null;
    }
  }

  async get(id) {
    this.open();
    try {
      const stmt = this.db.prepare(`SELECT * FROM users WHERE id = ?`);
      const user = await new Promise((resolve, reject) => {
        stmt.get(id, function(err, row){
          if (err) {
            reject(__filename + ":" + err);
          }
          resolve(row);
        });
      });

      this.finalize(stmt);

      return user;
    } catch (err) {
      console.error(__filename + ": " + err);
      return null;
    }
  }

  async authenticate(username, password) {
    this.open();
    try {
      const stmt = this.db.prepare(`
        SELECT *
        FROM users
        WHERE (username = ? or email = ?)
        AND password = ?
      `);
      const user = await new Promise((resolve, reject) => {
        stmt.get(
          username ?? null,
          username ?? null,
          getPasswordHash(password),
          function(err, row){
            if (err) {
              reject(__filename + ":" + err);
            }
            resolve(row);
          }
        );
      });

      this.finalize(stmt);

      return user;
    } catch (err) {
      console.error(__filename + ": " + err);
      return null;
    }
  }

  async create(user) {
    this.open();
    try {
      const insertStmt = this.db.prepare(`
        INSERT INTO users (first_name, last_name, username, email, password, profile_image, is_admin)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      const id = await new Promise((resolve, reject) => {
        insertStmt.run(
          user.first_name ?? null,
          user.last_name ?? null,
          user.username,
          user.email,
          getPasswordHash(user.password),
          user.profile_image ?? null,
          user.is_admin ?? 0,
          function(err){
            if (err) {
              reject(__filename + ":" + err);
            }
            resolve(this.lastID);
          }
        );
      });

      this.finalize(insertStmt);

      return id;
    } catch (err) {
      console.log(__filename + ":" + err);
      throw err;
    }
  }

  async update(userId, userData) {
    this.open();
    try {
      const password = userData.password
        ? `password = '${getPasswordHash(userData.password)}',`
        : "";
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

      const id = await new Promise((resolve, reject) => {
        stmt.run(
          userData.first_name,
          userData.last_name,
          userData.username,
          userData.email,
          userData.profile_image,
          userData.is_admin,
          userId,
          function(err){
            if (err) {
              reject(__filename + ":" + err);
            }
            resolve(this.lastID);
          }
        );
      });

      this.finalize(stmt);
      return id;
    } catch (err) {
      console.log(__filename + ":" + err);
      throw err;
    }
  }

  delete(id) {
    this.open();
    try {
      const stmt = this.db.prepare(`
        DELETE
        FROM users
        WHERE id = ?
      `);
      stmt.run(id);

      this.finalize(stmt);
    } catch (err) {
      console.log(__filename + ":" + err);
      throw err;
    }
  }
}

module.exports = UserModel;
