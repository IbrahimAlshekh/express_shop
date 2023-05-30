const {UserModel} = require('../models');
const {listen} = require("express/lib/application");

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
        let errors = [];
        let profileImage = req?.files?.profile_image
        const newImageName = (new Date()).getTime() + '_' + profileImage.name;

        new Promise((resolve, reject) => {
            profileImage?.mv(
                res.locals.base_dir + '/public/images/' + newImageName,
                (err) => {
                    if (err) {
                        reject(err);
                    }
                });
        }).then(()=>{

        }).catch((err) => {
            errors.push({profileImage:'Error: there was a problem uploading the profile image'});
        });

        const user = new UserModel();
        user.create({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            profile_image: newImageName,
            is_admin: req.body.is_admin ?? 0
        });

        if(errors.length > 0){
            res.render('admin/users/create', {
                title: 'users',
                error: errors.length > 0 ? JSON.stringify(errors) :'',
                user: {}
            })
        }else{
            res.redirect('/admin/users');
        }
    }
}

module.exports = UserController;