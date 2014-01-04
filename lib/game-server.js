var socketio = require('socket.io');
var url = require('url');
var User = require('./user');
var Game = require('./game');

var latestRoomId = 0;
// Maps socket.id to a user
var users = {};
// Maps roomId to a game
var games = {};
// Delete & adjust code below this line
// Stores array of names used in each room
var namesUsed = {};

exports.validRoom = validRoom;

exports.redirectToNewRoom = function(req, res, next) {
  latestRoomId++;
  namesUsed[latestRoomId] = [];
  res.redirect('/'+latestRoomId);
};

exports.listen = function(server) {
  io = socketio.listen(server);
  io.set('log level', 1);
  io.sockets.on('connection', function(socket){
  	console.log('connected');
  	var path = url.parse(socket.handshake.headers.referer).path;
  	var roomId = parseInt(path.substring(1));
  	if (validRoom(roomId)){
  		socket.join(roomId);
  		users[socket.id] = new User(roomId);
  		name = users[socket.id].nickname;
  		namesUsed[roomId].push(name);
  		socket.emit('init', {name: name, roomId: roomId});

  		handleMessageBroadcasting(socket)
  		// handleNameChangeAttempts(socket);
  		// handleChoosingCards(socket);
  		// handlePickingWinningCard(socket);
  	}
    /*
    joinRoom(socket, 'Lobby');
    handleMessageBroadcasting(socket, nickNames);
    handleNameChangeAttempts(socket, nickNames, namesUsed);
    handleRoomJoining(socket);

    socket.on('rooms', function(){
      socket.emit('rooms', io.sockets.manager.rooms);
    })
    handleClientDisconnection(socket, nickNames, namesUsed);*/
  });
}

function handleMessageBroadcasting(socket){
	socket.on('message', function(message){
		var roomId = users[socket.id].roomId;
		var name = users[socket.id].nickname;
		var msg =  name + ': ' + message;
		socket.broadcast.to(roomId).emit('message', msg);
	})
}

function validRoom (roomId) {
  return roomId > 0 && roomId <= latestRoomId;
};