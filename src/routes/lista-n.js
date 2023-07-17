const express = require('express');
const router = express.Router();
const {isLoggedIn, isNotLoggedIn} = require('../lib/auth');

//DB Connectoon
const pool = require('../database');

router.get('/', isLoggedIn, async (req,res)=>{
    const listado = await pool.query('SELECT lista_nominal.id as idee, case when lista_nominal.vota_pt=0 then "No" else "Si" end as vota_pt, lista_nominal.nombres as nom2,lista_nominal.ape_pat,lista_nominal.ape_mal,lista_nominal.direccion, lista_nominal.num_lista_nominal, (select secciones.seccion from secciones where secciones.id=lista_nominal.id_seccion) as seccion_lista, lista_nominal.programa, lista_nominal.monto ,casillas.id,casillas.casilla, lista_nominal.voto,lista_nominal.id_del, lista_nominal.telefono, delegados.nombres as apm, delegados.ape_pat as app1, delegados.ape_mat as app2 FROM `lista_nominal` INNER JOIN casillas on casillas.id=lista_nominal.id_casilla LEFT OUTER JOIN delegados on delegados.id=lista_nominal.id_del');
    const rojo1 = await pool.query('SELECT COUNT(*) as rojo1 FROM `lista_nominal` WHERE vota_pt>0');
    const rojo2 = await pool.query('SELECT COUNT(*) as rojo2 FROM `lista_nominal` WHERE vota_pt!=0 and voto!=0');
    const promo1 = await pool.query('SELECT COUNT(*) as promo1 FROM `lista_nominal` WHERE id_del!=0');
    const promo2 = await pool.query('SELECT COUNT(*) as promo2 FROM `lista_nominal` WHERE id_del!=0 and voto!=0');
    const negro1 = await pool.query('SELECT COUNT(*) as negro1 FROM `lista_nominal`');
    const negro2 = await pool.query('SELECT COUNT(*) as negro2 FROM `lista_nominal` WHERE voto!=0');
    const rojo1b = rojo1[0]; 
    const rojo2b = rojo2[0];
    const negro1b = negro1[0]; 
    const negro2b = negro2[0];
    const promo1b = promo1[0];
    const promo2b = promo2[0];
    res.render('secciones/l_nominal.hbs',{listado, negro1b, negro2b, rojo1b, rojo2b, promo1b, promo2b});
});

module.exports = router;