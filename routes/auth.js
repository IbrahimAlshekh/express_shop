const express = require('express');
const router = express.Router();
router.get('/login', function(req, res, next) {
    res.render('auth/login', {
        title: 'Login',
        products: [],
        error: "",
        success: "success",
    });
});

router.get('/signup', function(req, res, next) {
    res.render('auth/signup', {
        title: 'Login',
        products: [],
        error: "",
        success: "success",
    });
});

module.exports = router;