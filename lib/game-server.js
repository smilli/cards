var socketio = require('socket.io');
var url = require('url');
var cookie = require('express/node_modules/cookie');
var connect = require('express/node_modules/connect');
var parseSignedCookie = connect.utils.parseSignedCookie;
var Session = connect.middleware.session.Session;
var decks = require('./decks');
decks.init();
var Room = require('./room');

// TODO: Delete inactive rooms later
var latestRoomId = 0;
// Maps socket.id to a user
var users = {};

exports.validRoom = validRoom;
function validRoom (roomId) {
  return roomId > 0 && roomId <= latestRoomId;
};

exports.createNewRoom = function(req, res, next) {
  latestRoomId++;
  var room = new Room(latestRoomId);
  decks.addToRoom(latestRoomId, function(){
    res.redirect('/'+latestRoomId);
  });
};

exports.listen = function(server, secret, store) {
  io = socketio.listen(server);
  io.set('authorization', function(handshake, cb){
    if (handshake.headers.cookie) {
      handshake.cookie = cookie.parse(handshake.headers.cookie);
      handshake.sessionID = parseSignedCookie(handshake.cookie['connect.sid'], secret);
      store.get(handshake.sessionID, function(err, session){
        if (!err && session){
          handshake.session = new Session(handshake, session);
          console.log(handshake.session);
        }
      });
    }
    cb(null, true);
  });
  io.set('log level', 1);

  handleConnections();
}

function handleConnections(){
  io.sockets.on('connection', function(socket){
    var path = url.parse(socket.handshake.headers.referer).path;
    var roomId = parseInt(path.substring(1));
    var session = socket.handshake.session;

    if (validRoom(roomId)){
      var room = Room.getRoom(roomId);
      intiializeConnection(socket, room)

      decks.drawAnswer(roomId, 10, function(err, res){
        socket.emit('hand', res);
      });

      decks.getCurrQuestion(roomId, function(err, res){
        socket.emit('current question', res);
      });

      handleMessageBroadcasting(socket, room);
      // handleNameChangeAttempts(socket);
      // handleCardChoosing(socket);
      // handlePickingWinningCard(socket);
      handleClientDisconnection(socket, room);
    }
    /*
    handleNameChangeAttempts(socket, nickNames, namesInRoom);
    handleRoomJoining(socket);

    socket.on('rooms', function(){
      socket.emit('rooms', io.sockets.manager.rooms);
    })
    */
  });
}

function intiializeConnection(socket, room){
  socket.join(room.id);
  room.addNewUser(socket);
  var name = room.getUserName(socket.id);
  var canActivate = room.numPlayers() >= Room.MIN_PLAYERS;

  // send user info to client side to initialize Game
  socket.emit('init', {name: name, roomId: room.id, canActivate: canActivate});
}

// TODO: Don't allow guest names or names that are already taken
function changeNickname(socket, room){
  socket.on('change nickname', function(name){
    room.setUserName(socket.id, name, function(err, names){
      socket.emit({err: err, names: names});
      if (!err) socket.broadcast.to(roomId).emit(names);
    });
  });
}



function handleMessageBroadcasting(socket, room){
	socket.on('message', function(message){
		var name = room.getUserName(socket.id);
		var msg =  name + ': ' + message;
		socket.broadcast.to(room.id).emit('message', msg);
	});
}

function handleClientDisconnection(socket, room){
  socket.on('disconnect', function(){
    room.removeUser(socket);
  });
}

