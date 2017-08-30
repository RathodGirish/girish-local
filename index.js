var express = require('express');
var http = require('http');
var path = require('path');
var util = require('util');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var logger = require('morgan');
var mongoose = require('mongoose');
var database = require('./config/database'); 	// Get configuration file
var static = require('serve-static');
var app = express();
var routes = require('./routes');
var session = require('client-sessions');
var https = require('https');

var fs = require('fs');

//Connection with Database
mongoose.connect(database.url);
var db = mongoose.connection;

app.set('port', process.env.PORT || 1337);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(static(path.join(__dirname, 'public')));
app.use(express.json({limit: '50mb'}));
app.use(express.logger('dev'));
app.use(express.multipart());
app.use(express.urlencoded({limit: '50mb'}));
app.use(express.bodyParser({limit: '50mb', extended: true}));
app.use(express.methodOverride());
app.use(express.cookieParser('secret'));
app.use(express.session());


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

/********** Routes Files ************ */
var routes = require('./routes');
var user = require('./routes/user');
var common = require('./routes/common');
var challenge = require('./routes/challenge');

/*---------------------------User Routes------------------------------*/
app.post('/signup', user.signup);
app.post('/signin', user.signin);

/*---------------------------Challenge Routes------------------------------*/
app.get('/getChallenges', challenge.getChallenges);
app.get('/getChallengesByuserId', challenge.getChallengesByuserId);
app.get('/getChallengeDetail', challenge.getChallengeDetail);
app.get('/getChallengeById', challenge.getChallengeById);
app.post('/addChallenge', challenge.addChallenge);
app.post('/editChallengeById/:id', challenge.editChallengeById);
app.post('/removeChallengeById/:id', challenge.removeChallengeById);
app.post('/sendInvitation', challenge.sendInvitation);

/*---------------------------Challenge Routes------------------------------*/
app.get('/', routes.apiview);

http.createServer(app).listen(app.get('port'), function () {
	console.log('Express server listening on port ' + app.get('port'));
});