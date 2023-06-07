const express = require("express");
const router = express.Router();
const { UsersController } = require("../controllers");

/* GET users listing. */
router.post("/edit", UsersController.store);
router.get("/:id/edit", UsersController.editProfile);
router.get("/:id/profile", UsersController.showProfile);
router.get("/:id/cart", UsersController.showCart);
router.get("/:id/checkout", UsersController.checkout);

module.exports = router;
