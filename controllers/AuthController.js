const {UserModel} = require('../models');

class UsersController {

    static login(req, res, next) {
        res.render('auth/login', {title: 'login'});
    }

    static async authenticate(req, res, next) {
        const userModel = new UserModel();
        const user = await userModel.authenticate(req.body.username, req.body.password);
        console.log('user;',user)
        if (user) {
            req.session.user = user;
            res.redirect('/');
        } else {
            res.render('auth/login', {title: 'login', error: 'Invalid credentials'});
        }
    }

    static signup(req, res, next) {
        res.render('auth/signup', {title: 'signup'});
    }

    static async store(req, res, next) {
        const user = new UserModel();
        await user.create({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
        });

        res.render('auth/login', {
            title: 'login',
            success: 'Your account has been created successfully'
        });
    }

    static logout(req, res, next) {
        req.session.destroy();
        res.redirect('/');
    }


}

module.exports = UsersController;