const express = require('express');
const {ProductModel} = require("../models");
const router = express.Router();

/* GET home page. */
router.get('/', async function(req, res, next) {
  const product = new ProductModel();
  res.render('index', { title: 'Express Shop', products: await product.getAll()});
});

module.exports = router;
