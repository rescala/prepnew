const express = require('express');
const router = express.Router();
const passport = require('../lib/passport');
const { isLoggedIn } = require('../lib/auth');
const helpers = require('../lib/helpers');

//DB Connectoon
const pool = require('../database');

//Función de render de datos
router.get('/', isLoggedIn, async (req, res) => {
    const delegados = await pool.query('SELECT delegados.`id`, delegados.`nombres`, delegados.`ape_pat`, delegados.`ape_mat`, delegados.`telefono`, delegados.`comunidad`, delegados.`seccion`, delegados.`usuario`, delegados.`password`, delegados.`pw`, delegados.`id_mpio`, delegados.`estatus`, (select count(lista_nominal.`nombres`) from lista_nominal where lista_nominal.id_del=delegados.id) as referidos, (select COALESCE(sum(lista_nominal.voto=1),0) from lista_nominal where lista_nominal.id_del=delegados.id ) as votaron from delegados where delegados.id_mpio=?', req.session.example);
    console.log(req.session.example);
    const referidosb = await pool.query('SELECT count(lista_nominal.id) as promovidos from lista_nominal WHERE lista_nominal.id_del>0');
    const votadosb = await pool.query('SELECT count(lista_nominal.id) as promovidos from lista_nominal WHERE lista_nominal.id_del>0 and lista_nominal.voto>0');
    const referidos = referidosb[0];
    const votados = votadosb[0];
    res.render('delegados/list-r.hbs', { delegados, referidos, votados });
});

router.get('/acceso', isLoggedIn, async (req, res) => {
    const prueba = await pool.query('Select * from acceso where id=1;');
    const importante = prueba[0].activado;
    var estado = "";
    if (importante == 0) {
        estado = "Inhabilitado";
    } else {
        estado = "Habilitado";
    }
    res.render('delegados/acceso', { importante, estado });
});

router.post('/permitir', isLoggedIn, async (req, res) => {
    const estado = req.body.estado;
    if (estado == 1) {
        await pool.query('UPDATE `acceso` SET `activado`=1');
    } else {
        await pool.query('UPDATE `acceso` SET `activado`=0');
    }
    res.redirect('/delegados/acceso');
});

router.get('/registrar', isLoggedIn, async (req, res) => {
    const delegados = await pool.query('SELECT delegados.`id`, delegados.`nombres`, delegados.`ape_pat`, delegados.`ape_mat`, delegados.`telefono`, delegados.`comunidad`, delegados.`seccion`, delegados.`usuario`, delegados.`password`, delegados.`pw`, delegados.`id_mpio`, delegados.`estatus`, (select count(lista_nominal.`nombres`) from lista_nominal where lista_nominal.id_del=delegados.id) as referidos, (select COALESCE(sum(lista_nominal.voto=1),0) from lista_nominal where lista_nominal.id_del=delegados.id ) as votaron from delegados where delegados.id_mpio=?', req.session.example);
    const referidosb = await pool.query('SELECT count(lista_nominal.id) as promovidos from lista_nominal WHERE lista_nominal.id_del>0');
    const votadosb = await pool.query('SELECT count(lista_nominal.id) as promovidos from lista_nominal WHERE lista_nominal.id_del>0 and lista_nominal.voto>0');
    const referidos = referidosb[0];
    const votados = votadosb[0];
    res.render('delegados/list-r.hbs', { delegados, referidos, votados });
});

//Función de muestra de sección de registro de delegados
router.get('/add', isLoggedIn, async (req, res) => {
    const secc_del = await pool.query('select seccion from secciones where mpio=?', req.session.example);
    res.render('./delegados/add.hbs', { secc_del });
});

//Función asíncrona para registro de datos de delegados
router.post('/add', isLoggedIn, async (req, res) => {
    const { nombres, ape_pat, ape_mat, telefono, comunidad, seccion, } = req.body;
    const id_mpio = req.session.example;
    const newdelegado = {
        nombres,
        ape_pat,
        ape_mat,
        telefono,
        comunidad,
        seccion,
        id_mpio
    };
    console.log(newdelegado);
    await pool.query('Insert into delegados set ?', [newdelegado]);
    req.flash('success', 'Promotor Agregado Satisfactoriamente');
    res.redirect("/delegados/registrar");
});

//Función de eliminación de datos mediante ID
router.put("/delete/:id", isLoggedIn, async (req, res) => {
    const id = req.params.id;
    console.log(id);
    await pool.query('delete from delegados where id=' + id);
    await pool.query('UPDATE `lista_nominal` SET `vota_pt`=0,`id_del`=0 WHERE id_del=' + id);
    res.json('Eliminado');
});

//Función de render datos a editar
router.get("/edit/:id", isLoggedIn, async (req, res) => {
    const id = req.params.id;
    const delegados = await pool.query('select * from delegados where id=?', id);
    const secc_del = await pool.query('select seccion from secciones where mpio=?', req.session.example);
    res.render('./delegados/edit.hbs', { delegados: delegados[0], secc_del });

}); 

router.get('/casillas/', isLoggedIn, async (req, res) => {	
		const secciones = await pool.query('select id,seccion from secciones where mpio=92 ORDER BY seccion ASC;')
		res.render('casilla_admin/signin.hbs', { secciones });
});

router.post('/casillas_auth/', async (req, res) => {
		var username = req.body.seccion;
		var password = req.body.casilla;
		if (username && password) {
			pool.query('SELECT secciones.seccion, casillas.tipo_casilla, casillas.max, casillas.casilla, casillas.id FROM `casillas` inner join secciones on secciones.id=casillas.id_seccion where secciones.id=? and casillas.id=?', [username, password], function (error, results, fields) {
				if (results.length > 0) {
						const limite = results[0].tipo_casilla+1;
						pool.query('UPDATE `casillas` SET `tipo_casilla`='+limite+' WHERE id=' + results[0].id);
						console.log(limite);
						req.session.loggedin = true;
						req.session.username = results[0].id;
						res.redirect('/delegados/home');
				} else {
					req.flash('message', 'Casilla Inexistente');
					res.redirect('/delegados/casillas/');
				}
				res.end();
			});
		} else {
			req.flash('message', 'Ingresa los datos completos');
			res.redirect('back');
		}
});

router.get('/home', async (req, res) => {
	if (req.session.username) {
		const seccion = await pool.query('SELECT secciones.seccion as secc, casillas.casilla as cass, casillas.id FROM `casillas` inner join secciones on secciones.id=casillas.id_seccion where casillas.id=' + req.session.username);
		const votantes = await pool.query('select id,num_lista_nominal,nombres,ape_pat,ape_mal,id_del from lista_nominal where voto=0 and id_casilla=' + req.session.username + ' ORDER BY num_lista_nominal ASC;');
		res.render('casilla_admin/tabla.hbs', { seccion, votantes });
	} else {
		res.redirect('/delegados/casillas/');
	}
});

router.get("/promovidos/:id", isLoggedIn, async (req, res) => {
    const id = req.params.id;
    //console.log(id);
    const promovidos = await pool.query('SELECT lista_nominal.id,  case when lista_nominal.vota_pt=0 then "No" else "Si" end as vota_pt, secciones.seccion, casillas.casilla, lista_nominal.num_lista_nominal, lista_nominal.ape_pat, lista_nominal.ape_mal, case when lista_nominal.voto=0 then "No" else "Si" end as voto, lista_nominal.nombres, lista_nominal.programa, lista_nominal.monto, lista_nominal.telefono, lista_nominal.direccion FROM `lista_nominal` INNER JOIN secciones on lista_nominal.id_seccion=secciones.id INNER JOIN casillas on lista_nominal.id_casilla=casillas.id where lista_nominal.id_del=' + id);
    //console.log(promovidos);
    const delegado = await pool.query('select nombres from delegados where id=?', req.params.id);
    req.session.example2 = req.params.id;
    //console.log(delegado[0].nombres);
    const delegado2 = delegado[0].nombres;
    const delegado3 = req.params.id;
    //const listado = await pool.query('SELECT lista_nominal.id as id_persona, lista_nominal.nombres as nom2,lista_nominal.ape_pat,lista_nominal.ape_mal,lista_nominal.direccion, (select secciones.seccion from secciones where secciones.id=lista_nominal.id_seccion) as seccion_lista, (select casillas.casilla from casillas where casillas.id=lista_nominal.id_casilla) as casilla_lista, delegados.nombres as del_nombre,delegados.ape_pat as del_apepat,delegados.ape_mat as del_apemat FROM `lista_nominal` LEFT JOIN delegados on delegados.id=lista_nominal.id_del');
    const sinv = await pool.query('SELECT count(lista_nominal.id) as sinv from lista_nominal where lista_nominal.voto<1 and lista_nominal.id_del=' + id);
    const conv = await pool.query('SELECT count(lista_nominal.id) as conv from lista_nominal where lista_nominal.voto=1 and lista_nominal.id_del=' + id);
    const sinva = sinv[0].sinv; 
    const conva = conv[0].conv; 
    const secciones = await pool.query('select secciones.id,secciones.seccion from secciones where mpio='+req.session.example);
    res.render('./delegados/promovidos.hbs', { secciones, sinva, conva, promovidos, delegado2, delegado3 });
});

router.get('/detalles/:id', isLoggedIn, async (req, res) => {
    const resultado = await pool.query('SELECT lista_nominal.id as id, lista_nominal.nombres as nombres,lista_nominal.ape_pat,lista_nominal.ape_mal,lista_nominal.direccion, lista_nominal.num_lista_nominal, (select secciones.seccion from secciones where secciones.id=lista_nominal.id_seccion) as seccion_lista, case when lista_nominal.programa="" then "No" else "Si" end as programa, case when lista_nominal.presidencia="" then "No" else "Si" end as presidencia, lista_nominal.id_casilla, casillas.casilla, lista_nominal.voto,  case when lista_nominal.vota_pt=0 then "No" else "Si" end as vota_pt,lista_nominal.id_del, lista_nominal.telefono, delegados.nombres as apm, delegados.ape_pat as app1, delegados.ape_mat as app2 FROM `lista_nominal` INNER JOIN casillas on casillas.id=lista_nominal.id_casilla LEFT OUTER JOIN delegados on delegados.id=lista_nominal.id_del WHERE lista_nominal.id='+req.params.id);
    console.log(req.params.id);
    const result = Object.values(JSON.parse(JSON.stringify(resultado)));
    console.log(result);
    res.json(result);
});

router.get('/editar/:id', isLoggedIn, async (req, res) => {
    const id = req.params.id;
    const datos = await pool.query('select * from lista_nominal where id=' + id);
    const datos2 = datos[0];
    res.render('delegados/edit_p.hbs', datos2);
});

router.get('/acomodarlista/:id/:num', isLoggedIn, async (req, res) => {
    const id = req.params.id;
    const num = req.params.num;
    console.log('id: '+id+'\nvalor: '+num);    
    await pool.query('UPDATE lista_nominal SET num_lista_nominal ='+num+'  WHERE id='+id+';');
    res.json('Actualizado');
});

router.post('/editar_accion/', isLoggedIn, async (req, res) => {
    const { id, num_lista_nominal, id_casilla, nombres, ape_pat, ape_mal, direccion, presidencia, vota_pt, detalles, telefono, programa, monto } = req.body;
    const datos = {
        num_lista_nominal,
        id_casilla,
        nombres,
        ape_pat,
        ape_mal,
        direccion,
        telefono,
        vota_pt,
        detalles,
        presidencia,
        programa,
        monto
    };
    console.log(datos); 
    
    await pool.query('UPDATE lista_nominal SET ? where id = ?', [datos, id]);
    const datos2 = await pool.query('SELECT lista_nominal.id as id, lista_nominal.nombres as nombres,lista_nominal.ape_pat,lista_nominal.ape_mal,lista_nominal.direccion, lista_nominal.num_lista_nominal, (select secciones.seccion from secciones where secciones.id=lista_nominal.id_seccion) as seccion_lista, case when lista_nominal.programa="" then "No" else "Si" end as programa, case when lista_nominal.presidencia="" then "No" else "Si" end as presidencia, lista_nominal.id_casilla, casillas.casilla, lista_nominal.voto,  case when lista_nominal.vota_pt=0 then "No" else "Si" end as vota_pt,lista_nominal.id_del, lista_nominal.telefono, delegados.nombres as apm, delegados.ape_pat as app1, delegados.ape_mat as app2 FROM `lista_nominal` INNER JOIN casillas on casillas.id=lista_nominal.id_casilla LEFT OUTER JOIN delegados on delegados.id=lista_nominal.id_del WHERE lista_nominal.id='+id);
    res.json(datos2);
});

router.post('/editar_accion2/', isLoggedIn, async (req, res) => {
    const { id, num_lista_nominal, nombres, ape_pat, ape_mal, direccion, presidencia, vota_pt, detalles, telefono, programa, monto } = req.body;
    const datos = {
        num_lista_nominal,
        nombres,
        ape_pat,
        ape_mal,
        direccion,
        telefono,
        vota_pt,
        detalles,
        presidencia,
        programa,
        monto
    };
    console.log("Esta es la de control \n");
    console.log(id);
    console.log(datos); 
    await pool.query('UPDATE lista_nominal SET ? where id = ?', [datos, id]);
    res.redirect('back');
});

router.get("/listaXseccion/:id", isLoggedIn, async (req, res) => {
    const listado = await pool.query('SELECT lista_nominal.id as id_persona, lista_nominal.nombres as nom2,lista_nominal.ape_pat,lista_nominal.ape_mal,lista_nominal.direccion, (select secciones.seccion from secciones where secciones.id=lista_nominal.id_seccion) as seccion_lista, (select casillas.casilla from casillas where casillas.id=lista_nominal.id_casilla) as casilla_lista, delegados.nombres as del_nombre,delegados.ape_pat as del_apepat,delegados.ape_mat as del_apemat FROM `lista_nominal` LEFT JOIN delegados on delegados.id=lista_nominal.id_del where lista_nominal.id_seccion=' + req.params.id);
    console.log(listado);
    res.json(listado);
});

router.post("/promovidos/add/:id", isLoggedIn, async (req, res) => {
    const arr = req.body.asignar;
    console.log(arr);
    if (!arr) {
        req.flash('success', 'No se ha realizado ningún cambio');
        res.redirect('back');

    } else {
        if (!Array.isArray(arr)) {
            await pool.query('UPDATE lista_nominal SET lista_nominal.id_del=? where id = ?', [req.session.example2, arr]);
            req.flash('success', 'Se ha añadido 1 promovido satisfactoriamente');
        } else {
            for (let index = 0; index < arr.length; index++) {
                //console.log("Se Actualizará el ID "+arr[index]);
                await pool.query('UPDATE lista_nominal SET lista_nominal.id_del=? where id = ?', [req.session.example2, arr[index]]);
            }
            req.flash('success', 'Se han añadido' + arr.length + ' promovidos satisfactoriamente');
        }
    }
    res.redirect('back');
});

router.put("/promovidos/delete/:id", isLoggedIn, async (req, res) => {
    await pool.query('UPDATE lista_nominal SET lista_nominal.id_del=0 where id = ?', [req.params.id]);
    res.json('Eliminado');
});

//Función de edición 
router.post("/edit/:id", isLoggedIn, async (req, res) => {
    const { id } = req.params;
    if (req.body.password) {
        const { nombres, ape_pat, ape_mat, telefono, seccion, password, pw } = req.body;
        const editarDelegado = {
            nombres,
            ape_pat,
            ape_mat,
            telefono,
            seccion,
            password,
            pw
        };
        editarDelegado.password = await helpers.encryptPassword(password);
        editarDelegado.pw = password;
        await pool.query('UPDATE delegados SET ? where id = ?', [editarDelegado, id]);
    } else {
        const { nombres, ape_pat, ape_mat, telefono, seccion } = req.body;
        const editarDelegado = {
            nombres,
            ape_pat,
            ape_mat,
            telefono,
            seccion
        };
        await pool.query('UPDATE delegados SET ? where id = ?', [editarDelegado, id]);
    }
    req.flash('success', 'Datos del Promotor Editados Satisfactoriamente');
    res.redirect("/delegados/registrar");
});


module.exports = router;