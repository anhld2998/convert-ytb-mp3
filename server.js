// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');
require('dotenv').config();
var app      = express();
var port     = process.env.PORT;
var mongoose = require('mongoose');
var flash    = require('connect-flash');
const compression = require('compression');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');
// configuration ===============================================================
mongoose.connect(process.env.URL_DB); // connect to our database
app.use(compression({ level: 9 })); // Sử dụng cấp độ nén cao nhất

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs'); // set up ejs for templating
app.use(express.static("public"));
// required for passport
app.use(session({
    secret: 'ilovescotchscotchyscotchscotch', // session secret
    resave: true,
    saveUninitialized: true
}));
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
require('./app/routes.js')(app); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);
