const express = require('express');
const router = express.Router();
const { UsersController, ProductsController} = require('../controllers');

router.get('/', function(req, res, next) {
    res.render('admin/index', { title: 'dashboard' });
});

router.get('/orders', function(req, res, next) {
    res.render('admin/orders', { title: 'orders' });
});

// products routes
router.post('/products', ProductsController.store);
router.get('/products', ProductsController.index);
router.get('/products/create', ProductsController.create);
router.get('/products/edit/:id', ProductsController.edit);
router.delete('/products/:id', ProductsController.delete);

// User routes
router.post('/users', UsersController.store);
router.get('/users', UsersController.index);
router.get('/users/create', UsersController.create);
router.get('/users/edit/:id', UsersController.edit);
router.delete('/users/:id', UsersController.delete);

module.exports = router;