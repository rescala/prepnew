const express = require('express');
const router = express.Router();
const exphbs = require('express-handlebars');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//DB Connectoon
const pool = require('../database');

router.get('/', async (req, res) => {
    
    res.render('reportes/tabla.hbs'); 
});



module.exports = router;