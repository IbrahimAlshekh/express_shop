const { UserModel } = require('../models');


const userSeed = () => {
    const user = new UserModel();
    user.createTable();
    user.create({
        name: 'Admin',
        first_name: 'Admin',
        last_name: 'Admin',
        email: 'admin@expres-shop.com',
        password: 'admin',
        is_admin: true
    });
}