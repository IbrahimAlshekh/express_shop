const express = require("express");
const { ProductsController } = require("../controllers");
const router = express.Router();

/* GET users listing. */
router.post("/add-to-cart", ProductsController.addToCart);
router.get("/:id", ProductsController.show);
router.get("/", ProductsController.indexCards);

module.exports = router;
