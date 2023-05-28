const express = require('express');
const router = express.Router();
const { UserController } = require('../controllers');

router.get('/', function(req, res, next) {
    res.render('admin/index', { title: 'dashboard' });
});

router.get('/orders', function(req, res, next) {
    res.render('admin/orders', { title: 'orders' });
});

router.get('/products', function(req, res, next) {
    res.render('admin/products', { title: 'products' });
});

// User routes
router.get('/users', UserController.index);
router.get('/users/create', UserController.create);

module.exports = router;