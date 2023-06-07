const express = require("express");
const router = express.Router();
const { UsersController, OrdersController } = require("../controllers");

/* GET users listing. */
router.post('/order-success', OrdersController.makeOrder);
router.post('/make-order', OrdersController.makeOrder);
router.post("/edit", UsersController.store);
router.get("/:id/edit", UsersController.editProfile);
router.get("/:id/profile", UsersController.showProfile);
router.post("/:id/cart", OrdersController.updateCart);
router.get("/:id/cart", OrdersController.showCart);
router.get("/:id/checkout", OrdersController.checkout);

module.exports = router;
