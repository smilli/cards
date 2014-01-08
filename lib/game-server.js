var socketio = require('socket.io')
  , url = require('url')
  , cookie = require('express/node_modules/cookie')
  , connect = require('express/node_modules/connect')
  , SessionSockets = require('session.socket.io')
  , decks = require('./decks')
  , Room = require('./room');

var io;
decks.init();

exports.validRoom = validRoom;
function validRoom (roomId) {
  return roomId > 0 && roomId <= Room.latestRoomId;
};

exports.createNewRoom = function(req, res, next) {
  var room = new Room();
  decks.addToRoom(room.id, function(){
    res.redirect('/' + room.id);
  });
};

exports.listen = function(server, store, cookieParser) {
  io = socketio.listen(server);
  io.set('log level', 3);
  var sessionSockets = new SessionSockets(io, store, cookieParser);

  handleConnections(sessionSockets);
}

function handleConnections(sessionSockets){
  sessionSockets.on('connection', function(err, socket, session){
    if(!err){
      socket.on('init', function(data){
          console.log(data);
          var path = url.parse(data.url).path;
          var roomId = parseInt(path.substring(1));
          var room = Room.getRoom(roomId);

          intiializeConnection(socket, session, room);

          decks.drawAnswer(roomId, 10, function(err, res){
            socket.emit('hand', res);
          });

          decks.getCurrQuestion(roomId, function(err, res){
            socket.emit('current question', res);
          });

          handleMessageBroadcasting(socket, room);
          handleClientDisconnection(socket, room);
      });
    } else {
      console.log(err);
    }
  });
}

function intiializeConnection(socket, session, room){
  socket.join(room.id);
  room.addNewUser(socket);
  if(!room.active && room.numPlayers() === Room.MIN_PLAYERS){
    socket.broadcast.to(this.id).emit('can activate game');
  }
  var name = room.getUserName(socket.id);

  session.roomId = room.id;
  session.socketId = socket.id;
  session.save();

  // send user info to client side to initialize Game
  socket.emit('init', {name: name, roomId: room.id});
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
    if (room.active){
      room.deactivateUser(socket.id);
    } else{
      room.removeUser(socket.id);
      if(room.numPlayers() < Room.MIN_PLAYERS){
        socket.broadcast.to(room.id).emit('can not activate game');
      }
    }
  });
}

