const express = require('express');
const {ProductsController} = require("../controllers");
const router = express.Router();

/* GET users listing. */
router.get('/', ProductsController.indexCards);
router.get('/:id', ProductsController.show);

module.exports = router;
