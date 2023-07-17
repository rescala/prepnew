const express = require('express');
const router = express.Router();
const {isLoggedIn} = require('../lib/auth');

router.get('/', isLoggedIn, (req,res) =>{
    res.redirect('/delegados');
});

module.exports = router; 