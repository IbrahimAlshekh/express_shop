const express = require('express');
const router = express.Router();
const Product = require('../models/product');

/* GET home page. */
router.get('/', function(req, res, next) {
  const porduct = new Product();
  res.render('index', { title: 'Express Shop', products: [] });
});

module.exports = router;
