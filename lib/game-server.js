var socketio = require('socket.io');
var url = require('url');
var decks = require('./decks');
decks.init();
var User = require('./user');

var latestRoomId = 0;
// Maps socket.id to a user
var users = {};
// Maps roomId to list of nicknames in room
var namesInRoom = {};

exports.validRoom = validRoom;

function validRoom (roomId) {
  return roomId > 0 && roomId <= latestRoomId;
};

exports.createNewRoom = function(req, res, next) {
  latestRoomId++;
  namesInRoom[latestRoomId] = [];
  decks.addToRoom(latestRoomId, function(){
    res.redirect('/'+latestRoomId);
  });
};

exports.listen = function(server) {
  io = socketio.listen(server);
  io.set('log level', 1);
  io.sockets.on('connection', function(socket){
  	console.log('connected');
  	var path = url.parse(socket.handshake.headers.referer).path;
  	var roomId = parseInt(path.substring(1));
  	if (validRoom(roomId)){
      intiialize(socket, roomId)

      decks.drawAnswer(roomId, 10, function(err, res){
        socket.emit('hand', res);
      });

      decks.getCurrQuestion(roomId, function(err, res){
        socket.emit('current question', res);
      });

  		handleMessageBroadcasting(socket);
  		// handleNameChangeAttempts(socket);
  		// handleCardChoosing(socket);
  		// handlePickingWinningCard(socket);
      handleClientDisconnection(socket);
  	}
    /*
    joinRoom(socket, 'Lobby');
    handleNameChangeAttempts(socket, nickNames, namesInRoom);
    handleRoomJoining(socket);

    socket.on('rooms', function(){
      socket.emit('rooms', io.sockets.manager.rooms);
    })
    */
  });
}

function intiialize(socket, roomId){
  socket.join(roomId);

  // store info about user
  users[socket.id] = new User(roomId);
  name = users[socket.id].nickname;
  namesInRoom[roomId].push(name);

  // send user info to client side to initialize Game
  socket.emit('init', {name: name, roomId: roomId});
}

function handleMessageBroadcasting(socket){
	socket.on('message', function(message){
		var roomId = users[socket.id].roomId;
		var name = users[socket.id].nickname;
		var msg =  name + ': ' + message;
		socket.broadcast.to(roomId).emit('message', msg);
	});
}

function handleClientDisconnection(socket){
  socket.on('disconnect', function(){
    var roomId = users[socket.id].roomId;
    var name = users[socket.id].nickname;
    delete users[socket.id];
    delete namesInRoom[roomId][name];
  });
}

