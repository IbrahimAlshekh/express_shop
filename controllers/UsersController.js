const {UserModel} = require('../models');
const {deleteImage} = require("../lib/utils");

class UsersController {
    static async index(req, res, next) {
        const user = new UserModel();
        res.render('admin/users/index', {title: 'users', users: await user.getAll()});
    }

    static async edit(req, res, next) {
        const user = new UserModel();
        res.render('admin/users/edit', {title: 'users', user: await user.get(req.params.id)});
    }

    static create(req, res, next) {
        res.render('admin/users/create', {title: 'users', user: {}});
    }

    static store(req, res, next) {
        let errors = [];
        let profileImage = req?.files?.profile_image
        let newImageName = null;
        if (profileImage) {
            newImageName = (new Date()).getTime() + '_' + profileImage.name;
            new Promise((resolve, reject) => {
                profileImage?.mv(
                    res.locals.base_dir + '/public/images/' + newImageName,
                    (err) => {
                        if (err) {
                            reject(err);
                        }
                    });
            }).then(() => {

            }).catch(() => {
                errors.push({profileImage: 'Error: there was a problem uploading the profile image'});
            });
        }

        const user = new UserModel();
        if (req.body.action === 'create') {
            user.create({
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                username: req.body.username,
                email: req.body.email,
                password: req.body.password,
                profile_image: newImageName ?? '',
                is_admin: req.body.is_admin === 'on' ? 1 : 0
            });
        } else if (req.body.action === 'edit') {
            user.update(req.body.id, {
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                username: req.body.username,
                email: req.body.email,
                profile_image: newImageName ?? req.body.profile_image_name,
                is_admin: req.body.is_admin === 'on' ? 1 : 0
            });
        }

        if (errors.length > 0) {
            res.render('admin/users/' + req.body.action, {
                title: 'users',
                error: errors.length > 0 ? JSON.stringify(errors) : '',
                user: {}
            })
        } else {
            res.redirect('/admin/users');
        }
    }

    static async delete(req, res, next) {
        const user = new UserModel();
        const productData = await user.get(req.params.id);
        deleteImage(res.locals.image_dir + productData.profile_image)
        await user.delete(req.params.id);
        res.redirect('/admin/users');
    }
}

module.exports = UsersController;