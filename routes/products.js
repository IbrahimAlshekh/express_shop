const express = require('express');
const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('products/products', { title: 'products', products: [] });
});

module.exports = router;
