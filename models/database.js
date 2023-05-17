const sqlite3 = require('sqlite3');

const db = () => {
    return new sqlite3.Database('./db.sqlite3', (err) => {
        if (err) {
            console.log('Error connecting to the database.')
        }
        console.log('Connected to the database.')
        return db;
    });
}

module.exports = {
    db
}

