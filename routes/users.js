const express = require("express");
const router = express.Router();
const { UsersController, OrdersController } = require("../controllers");

/* GET users listing. */
router.get('/order-success', OrdersController.orderSuccess);
router.post('/make-order', OrdersController.makeOrder);
router.post("/edit", UsersController.store);
router.get("/:id/edit", UsersController.editProfile);
router.get("/:id/profile", UsersController.showProfile);
router.post("/:id/cart", OrdersController.updateCart);
router.get("/:id/cart", OrdersController.showCart);
router.get("/:id/checkout", OrdersController.checkout);
router.get("/:id/orders", OrdersController.showUserOrders);
router.get("/:id/orders/:order_id", OrdersController.showUserOrderDetails);

module.exports = router;
