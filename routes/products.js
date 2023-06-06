const express = require("express");
const { ProductsController } = require("../controllers");
const router = express.Router();

/* GET users listing. */
router.get("/", ProductsController.indexCards);
router.get("/:id", ProductsController.show);
router.post("/add-to-cart", ProductsController.addToCart);

module.exports = router;
