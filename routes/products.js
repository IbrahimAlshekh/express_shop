const express = require("express");
const { ProductsController,OrdersController } = require("../controllers");
const router = express.Router();

/* GET users listing. */
router.get("/search", ProductsController.search);
router.post("/add-to-cart", OrdersController.addToCart);
router.get("/:id", ProductsController.show);
router.get("/", ProductsController.indexCards);

module.exports = router;
