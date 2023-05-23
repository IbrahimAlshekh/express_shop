const express = require('express');
const {Product} = require("../models");
const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  const product = new Product();

  res.render('products/products', { title: 'products', products: product.getAll() });
});

module.exports = router;
