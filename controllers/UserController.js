const {UserModel} = require('../models');

class UserController {
    static async index(req, res, next) {
        const user = new UserModel();
        res.render('admin/users/index', {title: 'users', users: await user.getAll()});
    }

    static edit(req, res, next) {
        const user = new UserModel();
        res.render('admin/users/edit', {title: 'users', users: user.getAll()});
    }

    static create(req, res, next) {
        res.render('admin/users/create', {title: 'users', user: {}});
    }

    static store(req, res, next) {
        res.render('admin/users/store', {title: 'users', user: {}});
    }
}

module.exports = UserController;