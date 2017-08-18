var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var path        =  	   require('path');
var static      =      require( 'serve-static' );
var jsonParser = bodyParser.json();
var logger = require('morgan');
var mongoose = require('mongoose');
var database = require('./config/database'); 	// Get configuration file
var app = express();

//Connection with Database
mongoose.connect(database.url);
var db = mongoose.connection;

app.set('port', process.env.PORT || 1337);
app.set('views',path.join(__dirname,'views'));
app.set('view engine', 'ejs');
app.use( static( path.join( __dirname, 'public' )));
app.use(bodyParser.json());
app.use(logger('dev'));
app.use(bodyParser());

app.use(function (req, res, next) {

	// Website you wish to allow to connect
	res.setHeader('Access-Control-Allow-Origin', '*');

	// Request methods you wish to allow
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

	// Request headers you wish to allow
	// res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization ,Accept');

	res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");

	// res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization ,Accept');

	// Set to true if you need the website to include cookies in the requests sent
	// to the API (e.g. in case you use sessions)
	res.setHeader('Access-Control-Allow-Credentials', true);

	// Pass to next layer of middleware
	next();
});

/**********user */
var user = require('./routes/user');
var common = require('./routes/common');
var challenge = require('./routes/challenge');

/*---------------------------User Routes------------------------------*/
app.get('/', user.index);
app.post('/signup', user.signup);
app.post('/signin', user.signin);

/*---------------------------Challenge Routes------------------------------*/
app.get('/getChallanges', challenge.getChallanges);




http.createServer(app).listen(app.get('port'), function () {
	console.log('Express server listening on port ' + app.get('port'));
});