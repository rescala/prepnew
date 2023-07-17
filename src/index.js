const express = require('express');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const path = require('path');
const flash = require('connect-flash');
const session = require('express-session');
const mysqlStore = require('express-mysql-session');
const {database} = require('./keys');
const passport = require('passport'); 


//Inicialization
const app = express();
require('./lib/passport');


//Settings
app.set('port', process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'views'))
app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'),'layouts'),
    partialsDir: path.join(app.get('views'),'partials'),
    extname: '.hbs',
    helpers: require('./lib/handlebars')
}));
app.set('view engine','.hbs');

//Middlewares
app.use(session({
    secret: 'prueba',
    resave: false,
    saveUninitialized: false,
    store: new mysqlStore(database)
}));
app.use(flash());
app.use(morgan('dev'));
app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

//Global Variables
app.use((req,res,next)=>{
    app.locals.success = req.flash('success');
    app.locals.message = req.flash('message');
    app.locals.user=req.user;
    next();
});

//Routes
app.use(require("./routes"));
app.use(require("./routes/authentications"));
app.use('/mpios',require("./routes/mpios"));
app.use('/delegados',require("./routes/delegados"));
app.use('/lista-n',require("./routes/lista-n"));
app.use('/promotores',require("./routes/promotores"));
app.use('/casillas',require("./routes/casillas"));
app.use('/visores',require("./routes/visores"));
app.use('/visor',require("./routes/visor"));
app.use('/reportes',require("./routes/reportes"));



//Public
app.use(express.static(path.join(__dirname,'public')));


//Starting Server
app.listen(app.get('port'), ()=>{
    console.log("Server on Port ", app.get('port'));
});