const express = require('express');
const router = express.Router();
router.get('/', function(req, res, next) {
    res.render('admin/index', { title: 'dashboard' });
});

router.get('/orders', function(req, res, next) {
    res.render('admin/orders', { title: 'orders' });
});

router.get('/products', function(req, res, next) {
    res.render('admin/products', { title: 'products' });
});

router.get('/customers', function(req, res, next) {
    res.render('admin/customers', { title: 'customers' });
});

module.exports = router;