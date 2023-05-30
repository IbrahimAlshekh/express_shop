const {ProductModel} = require('../models');
const {raw} = require("express");

class ProductController {
    static async index(req, res, next) {
        const product = new ProductModel();
        res.render('admin/products/index', {title: 'products', products: await product.getAll()});
    }

    static async edit(req, res, next) {
        const product = new ProductModel();
        res.render('admin/products/edit', {title: 'products', product: await product.get(req.params.id)});
    }

    static create(req, res, next) {
        res.render('admin/products/create', {title: 'products', product: {}});
    }

    static async store(req, res, next) {
        let errors = [];
        let productThumbnail = req?.files?.thumbnail
        let newImageName = null;
        if (productThumbnail) {
            newImageName = (new Date()).getTime() + '_' + productThumbnail.name;
            new Promise((resolve, reject) => {
                productThumbnail?.mv(
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


        const product = new ProductModel();
        if(req.body.action === 'create') {
            const cr = await product.create({
                name: req.body.name,
                description: req.body.description,
                thumbnail: newImageName ?? '',
                price: req.price
            });

            console.log(cr);


        }else if(req.body.action === 'edit'){
            product.update(req.body.id, {
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                productname: req.body.productname,
                email: req.body.email,
                profile_image: newImageName ?? req.body.profile_image_name,
                is_admin: req.body.is_admin === 'on' ? 1 : 0
            });
        }

        for (let ke in req.files) {
            if (ke ==='thumbnail') continue;
            let file = req.files[ke];
            if (file) {
                newImageName = (new Date()).getTime() + '_' + file.name;
                new Promise((resolve, reject) => {
                    file?.mv(
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
        }

        if (errors.length > 0) {
            res.render('admin/products/' + req.body.action, {
                title: 'products',
                error: errors.length > 0 ? JSON.stringify(errors) : '',
                product: {}
            })
        } else {
            res.redirect('/admin/products');
        }
    }

    static async delete(req, res, next) {
        const product = new ProductModel();
        await product.delete(req.params.id);
        res.redirect('/admin/products');
    }
}

module.exports = ProductController;