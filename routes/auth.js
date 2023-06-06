const express = require("express");
const { AuthController } = require("../controllers");
const router = express.Router();

router.get("/login", AuthController.login);
router.post("/login", AuthController.authenticate);
router.post("/logout", AuthController.logout);
router.get("/signup", AuthController.signup);
router.post("/signup", AuthController.store);

module.exports = router;
