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
    decks.getCurrQuestion(room.id, function(err, question){
      room.currQuestion = question;
      res.redirect('/' + room.id);
    });
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
    if (!err){
      socket.on('init', function(data){
          var path = url.parse(data.url).path;
          var roomId = parseInt(path.substring(1));

          if (validRoom(roomId)) {
            var room = Room.getRoom(roomId);
            initializeConnection(socket, session, room, function(user){
              handleMessageBroadcasting(socket, user, room);
              handleClientDisconnection(socket, user, room);
              handleGameActivation(socket, user, room);
              handleCardChoosing(socket, user, room);
            });
          }
      });
    } else {
      console.log(err);
    }
  });
}

function initializeConnection(socket, session, room, cb){
  socket.join(room.id);
  var user;

  // if room is active user must have been in room already
  if (room.hasBeenInRoom(session.userId)) {
    user = (room.inactiveUsers[session.userId])
                  ? room.inactiveUsers[session.userId]
                  : room.users[session.userId];
    room.users[session.userId] = user;
    delete room.inactiveUsers[session.userId];
    emitInitVars(socket, user, room);
    cb(user);
  } else {
    user = room.addNewUser(socket.id);
    // this user made us meet our min player requirement
    if(!room.active && room.numPlayers() === Room.MIN_PLAYERS){
      socket.broadcast.to(this.id).emit('can activate game');
    }

    session.roomId = room.id;
    session.userId = user.id;
    session.save();

    decks.drawAnswer(room.id, 10, function(err, res){
      user.cards = res;
      emitInitVars(socket, user, room);
      cb(user);
    });
  }

  socket.broadcast.to(room.id).emit('new user', [user]);
}

function emitInitVars(socket, user, room){
    var users = Object.keys(room.users).map(function (key) {
      return room.users[key];
    });
    // send user info to client side to initialize Game
    socket.emit('init', {
      name: user.nickname, 
      roomId: room.id, 
      cards: user.cards, 
      question: room.currQuestion,
      users: users
    });
}

function changeNickname(socket, user, room){
  socket.on('change nickname', function(name){
    room.setUserName(user, name, function(err, names){
      socket.emit({err: err, names: names});
      if (!err) socket.broadcast.to(roomId).emit(names);
    });
  });
}


function handleMessageBroadcasting(socket, user, room){
	socket.on('message', function(message){
		var name = user.nickname;
		var msg =  name + ': ' + message;
		socket.broadcast.to(room.id).emit('message', msg);
	});
}

function handleClientDisconnection(socket, user, room){
  socket.on('disconnect', function(){
    if (room.active){
      room.deactivateUser(user.id);
    } else{
      room.removeUser(user.id);
      if(room.numPlayers() < Room.MIN_PLAYERS){
        socket.broadcast.to(room.id).emit('can not activate game');
      }
      // put user's cards back
      decks.addToAnswerDeck(user.cards);
    }
    socket.broadcast.to(room.id).emit('remove user', user);
  });
}

function handleGameActivation(socket, user, room){
  socket.on('start game', function(cb){
    room.activate(user);
    cb();
    socket.broadcast.to(room.id).emit('start game', {wordCzar: user.nickname});
    createTimer(60*2, room);
  });
}

function createTimer(timeLeft, room){
  var updateTimer = setInterval(timer, 1000);
  function timer(){
    io.sockets.in(room.id).emit('tick', timeLeft);
    timeLeft--;
    if (timeLeft < 0){
      clearInterval(updateTimer);
      io.sockets.in(room.id).emit('choosing time over');
    }
  }
}

function handleCardChoosing(socket, user, room){
  socket.on('card chosen', function(card, cb){
    user.cardChosen = card;
    room.numCardsChosen++;
    if (room.numCardsChosen === room.numPlayers()){
      io.sockets.in(room.id).emit('card choosing over');
    }
    decks.drawAnswer(room.id, 1, function(err, res){
      cb(res[0]);
    });
  });
}
