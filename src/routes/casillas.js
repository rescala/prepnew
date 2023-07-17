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

router.get('/', async (req, res) => {
	if (req.session.username) {

		res.redirect('/casillas/home');
	} else {
		const secciones = await pool.query('select id,seccion from secciones where mpio=92 ORDER BY seccion ASC;')
		res.render('casillas/signin.hbs', { secciones, layout: 'main casillas' });
	}

});

router.get('/cons_casilla/:id', async (req, res) => {
	const casillas = await pool.query('select * from casillas where id_seccion='+req.params.id);
	res.json(casillas);
	console.log(casillas);
});

router.post('/auth', async (req, res) => {
	const prueba = await pool.query('Select * from acceso where id=1;');
	if (prueba[0].activado == 1) {
		var username = req.body.seccion;
		var password = req.body.casilla;
		if (username && password) {
			pool.query('SELECT secciones.seccion, casillas.tipo_casilla, casillas.max, casillas.casilla, casillas.id FROM `casillas` inner join secciones on secciones.id=casillas.id_seccion where secciones.id=? and casillas.id=?', [username, password], function (error, results, fields) {
				if (results.length > 0) {
					if (results[0].tipo_casilla < results[0].max) {
						const limite = results[0].tipo_casilla+1;
						pool.query('UPDATE `casillas` SET `tipo_casilla`='+limite+' WHERE id=' + results[0].id);
						console.log(limite);
						req.session.loggedin = true;
						req.session.username = results[0].id;
						res.redirect('/casillas/home');
					} else {
						req.flash('message', 'Límite de Usuarios en Casilla Alcanzado');
						res.redirect('/casillas/');
					}
				} else {
					req.flash('message', 'Casilla Inexistente');
					res.redirect('/casillas/');
				}
				res.end();
			});
		} else {
			res.send('Please enter Username and Password!');
			res.end();
		}
	} else {
		req.flash('message', 'Acceso Deshabilitado');
		res.redirect('/casillas/');
	}

});

router.get('/home', async (req, res) => {
	if (req.session.username) {
		const seccion = await pool.query('SELECT secciones.seccion as secc, casillas.casilla as cass, casillas.id FROM `casillas` inner join secciones on secciones.id=casillas.id_seccion where casillas.id=' + req.session.username);
		const votantes = await pool.query('select id,num_lista_nominal,nombres,ape_pat,ape_mal,id_del from lista_nominal where voto=0 and id_casilla=' + req.session.username + ' ORDER BY num_lista_nominal ASC;');
		res.render('casillas/tabla.hbs', { seccion, votantes, layout: 'main2' });
	} else {
		res.redirect('/casillas/');
	}
});

router.put('/votar/:id', async (req, res) => {
	await pool.query('UPDATE `lista_nominal` SET `voto`=1 WHERE id=' + req.params.id);
	res.json('Actualizado');
});


router.get('/logout', async (req, res) => {
	const instante = await pool.query('SELECT * FROM casillas WHERE id=' + req.session.username);
	const valor=instante[0].tipo_casilla;
	const vvalor=valor-1;
	console.log(instante);
	pool.query('UPDATE `casillas` SET `tipo_casilla`='+vvalor+' WHERE id=' + instante[0].id);
	req.session.destroy();
	req.logOut();
	res.redirect('/casillas');
});

module.exports = router;