const passport = require('passport');
const localstrategy = require('passport-local').Strategy;
const session = require('express-session');
//const express = require('express');


const pool = require('../database');
const helpers = require('../lib/helpers');

passport.use('local.signin', new localstrategy({
    usernameField: 'usuario',
    passwordField: 'password',
    passReqToCallback: true
}, async(req, usuario, password, done) => {
    const row = await pool.query('select * from usuarios where usuario=?', [usuario]);
    //console.log(row);
    if (row.length > 0) {
        const user = row[0];
        const validP = await helpers.matchPassword(password,user.password);
        if (validP) {
            req.session.example = user.id_mpio; 
            done(null, user, req.flash('success','Bienvenido, '+user.nombres));
        } else {
            done(null, false, req.flash('message','Contraseña Incorrecta'));
        }
    } else {
        console.log('No Existe Usuario');
        return done ( null, false, req.flash('message','Datos Inexistentes'));
    }
}));

passport.use('local.signup', new localstrategy({
    usernameField: 'usuario',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, usuario,password, done) => {
    const {nombres} = req.body;
    const {apellidos} = req.body;
    const newUser = {
        usuario,
        password,
        apellidos,
        nombres
    };
    newUser.password = await helpers.encryptPassword(password);
    //console.log(newUser.password);
    const result = await pool.query('insert into delegados set ?', [newUser]);
    newUser.id = result.insertId; 
    return done(null, newUser);
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    const filas = await pool.query('select * from usuarios where id=?',[id]);
    done (null, filas[0]);
});