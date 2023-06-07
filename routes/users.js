const express = require("express");
const router = express.Router();
const { UsersController } = require("../controllers");

/* GET users listing. */
router.post("/edit", UsersController.store);
router.get("/:id/edit", UsersController.editProfile);
router.get("/:id/profile", UsersController.showProfile);

module.exports = router;
