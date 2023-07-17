const express = require('express');
const router = express.Router();
const exphbs = require('express-handlebars');
var app = express();
var session = require('express-session');
var bodyParser = require('body-parser');
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//DB Connectoon
const pool = require('../database');

router.get('/', (req, res) => {
	if (req.session.username) {

		res.redirect('/promotores/home');
	} else {
		res.render('promotores/signin.hbs', { layout: 'main3' });
	}

});

router.post('/auth', async (req, res) => {
	const prueba = await pool.query('Select * from acceso where id=1;');
	console.log(prueba[0].activado);
	if (prueba[0].activado == 1) {
		var username = req.body.telefono;
		var password = req.body.password;
		if (username && password) {
			pool.query('SELECT delegados.id, delegados.telefono, delegados.nombres, delegados.pw FROM `delegados` where delegados.telefono=? and delegados.pw=?', [username, password], function (error, results, fields) {
				if (results.length > 0) {
					req.session.loggedin = true;
					req.session.username = results[0].id;
					res.redirect('/promotores/home')
				} else {
					req.flash('message', 'Promotor Inexistente');
					res.redirect('/promotores/');
				}
				res.end();
			});
		} else {
			res.send('Please enter Username and Password!');
			res.end();
		}
	} else {
		req.flash('message', 'Acceso Deshabilitado');
		res.redirect('/promotores/');
	};

});

router.get('/home', async (req, res) => {
	if (req.session.username) {
		const lista = await pool.query('SELECT * FROM `lista_nominal` where lista_nominal.voto=0 and lista_nominal.id_del=' + req.session.username);
		const lista2 = await pool.query('SELECT lista_nominal.id as idee, case when lista_nominal.vota_pt=0 then "No" else "Si" end as vota_pt, lista_nominal.nombres as nom2,lista_nominal.ape_pat,lista_nominal.ape_mal,lista_nominal.direccion, lista_nominal.num_lista_nominal, (select secciones.seccion from secciones where secciones.id=lista_nominal.id_seccion) as seccion_lista, lista_nominal.programa, lista_nominal.monto ,casillas.id,casillas.casilla, lista_nominal.voto,lista_nominal.id_del, lista_nominal.telefono, delegados.nombres as apm, delegados.ape_pat as app1, delegados.ape_mat as app2 FROM `lista_nominal` INNER JOIN casillas on casillas.id=lista_nominal.id_casilla LEFT OUTER JOIN delegados on delegados.id=lista_nominal.id_del where lista_nominal.vota_pt>0');
		const lista3 = await pool.query('SELECT lista_nominal.id as idee, case when lista_nominal.vota_pt=0 then "No" else "Si" end as vota_pt, lista_nominal.nombres as nom2,lista_nominal.ape_pat,lista_nominal.ape_mal,lista_nominal.direccion, lista_nominal.num_lista_nominal, (select secciones.seccion from secciones where secciones.id=lista_nominal.id_seccion) as seccion_lista, lista_nominal.programa, lista_nominal.monto ,casillas.id,casillas.casilla, lista_nominal.voto,lista_nominal.id_del, lista_nominal.telefono, delegados.nombres as apm, delegados.ape_pat as app1, delegados.ape_mat as app2 FROM `lista_nominal` INNER JOIN casillas on casillas.id=lista_nominal.id_casilla LEFT OUTER JOIN delegados on delegados.id=lista_nominal.id_del');
		const delegado = await pool.query('select delegados.nombres as nombre from delegados where delegados.id=' + req.session.username);
		const votados = await pool.query('SELECT count(*) as conteo FROM `lista_nominal` WHERE lista_nominal.voto=1 and lista_nominal.id_del=' + req.session.username);
		const novotados = await pool.query('SELECT count(*) as conteo FROM `lista_nominal` WHERE lista_nominal.voto=0 and lista_nominal.id_del=' + req.session.username);
		const votadospt = await pool.query('SELECT count(*) as conteo FROM `lista_nominal` WHERE lista_nominal.voto=1 and lista_nominal.vota_pt>0');
		const novotadospt = await pool.query('SELECT count(*) as conteo FROM `lista_nominal` WHERE lista_nominal.voto=0 and lista_nominal.vota_pt>0');
		const votadosgen = await pool.query('SELECT count(*) as conteo FROM `lista_nominal` WHERE lista_nominal.voto=1');
		const novotadosgen = await pool.query('SELECT count(*) as conteo FROM `lista_nominal` WHERE lista_nominal.voto=0');
		res.render('promotores/tabla.hbs', { lista, lista2, delegado, votados, novotados, votadospt, lista3, novotadosgen, votadosgen, novotadospt, layout: 'main3' });
	} else {
		res.redirect('/promotores/');
	}
});

router.get('/logout', (req, res) => {
	req.session.destroy();
	req.logOut();
	res.redirect('/promotores');
});

module.exports = router;