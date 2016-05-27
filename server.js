// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');
var app      = express();
var path 	 = require('path');
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

var configDB = require('./config/database.js');

// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({extended: true})); // get information from html forms
app.use(express.static(path.join(__dirname,'./client')));
app.use(bodyParser.json());
app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({ secret: 'thisgameisverrysecret' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
app.set('views', path.join(__dirname, "./client/views"));

// routes ======================================================================




require('./app/routes.js')(app, passport);     // load our routes and pass in our app and fully configured passport

// launch ======================================================================
var server = app.listen(8000, function(){
	console.log('The magic happens on port 8080');

})
	//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

	// sockets

	var io = require('socket.io').listen(server);
var users = {'/#GGAaHEs2RQX1C00rAAAB': 'bas'}
var messages = []

var user_excist = function(user){
	for(var i in users){
		if(user == users[i]){
			return true;
		}
	}
	return false;
}

io.sockets.on('connection', function (socket) {
	console.log(users);

	socket.emit('messages', messages)

	var socketID = socket.id
	socket.on('got_new_user', function(data){
		console.log('the user is ' + data.name);
		
		

		if(user_excist(data.name)=== true){
			socket.emit('name_taken', {error: "this name is already taken"});
		} else {
			users[socketID]= data.name ;
			console.log(users);
			socket.emit('get_conversation', {current_user: data.name });
			socket.broadcast.emit('new_login', {user: data.name})
		}

		
	})

	socket.on("message_send", function(data){
		var user = data.user
		console.log(data)
		messages.push({name: data.user, message: data.message});
		console.log(messages);
		io.emit('messages', messages)
	})

	socket.on('disconnect', function(){
		console.log('logging out')
		// Create a message that you will send to all other users, letting them know 
		// that this user has logged out of the chat
		message = users[socketID] + ' has just logged out';
		// delete that user from the list of users 
		delete users[socketID];
		socket.broadcast.emit('logout', {message: message});
	})


})