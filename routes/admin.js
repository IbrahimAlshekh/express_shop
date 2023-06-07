const express = require('express');
const router = express.Router();
const { UsersController, ProductsController, OrdersController} = require('../controllers');

router.get('/',OrdersController.index);

// orders routes
router.get('/orders', OrdersController.index);
router.get('/orders/:id', OrdersController.show);
router.post('/orders/:id', OrdersController.updateOrderStatus);

// products routes
router.post('/products', ProductsController.store);
router.get('/products', ProductsController.index);
router.get('/products/create', ProductsController.create);
router.get('/products/edit/:id', ProductsController.edit);
router.delete('/products/:id', ProductsController.delete);
router.delete('/products/gallery/:id', ProductsController.deleteGalleryImage);

// User routes
router.post('/users', UsersController.store);
router.get('/users', UsersController.index);
router.get('/users/create', UsersController.create);
router.get('/users/edit/:id', UsersController.edit);
router.delete('/users/:id', UsersController.delete);

module.exports = router;