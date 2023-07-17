const express = require('express');
const router = express.Router();
const passport = require('passport');
const {isLoggedIn, isNotLoggedIn} = require('../lib/auth');

router.get('/signup',isNotLoggedIn, (req,res)=>{
    res.render('./auth/signup'); 
});

router.post('/signup', isNotLoggedIn, passport.authenticate('local.signup',{
    successRedirect: '/inicio',
    failureRedirect: '/signup',
    failureFlash: true
}));

router.get('/signin',isNotLoggedIn, (req,res)=>{
    res.render('auth/signin');
});

router.post('/signin', (req, res, next) => {
    passport.authenticate('local.signin',{
        successRedirect: '/delegados',
        failureRedirect: '/signin',
        failureFlash: true
    })(req, res, next);
}); 

router.get('/logout', isLoggedIn, (req,res) => {
    req.logOut();
    res.redirect('/signin');
});

module.exports = router;