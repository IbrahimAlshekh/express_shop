const express = require('express');
const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('users', { title: 'Users', products: [] });
});

router.get('/login', function(req, res, next) {
    res.render('login', { title: 'Login', products: [] });
});

module.exports = router;
