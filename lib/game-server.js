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
              handleChoosingWinningCards(socket, user, room);
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

  // if user was in the room before don't create a new user
  if (room.id === session.roomId && room.hasBeenInRoom(session.userId)) {
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
      cardChosen: user.cardChosen, 
      question: room.currQuestion,
      users: users,
      isCardCzar: user === room.cardCzar
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
    // if 2 users both click start game only set 1 of them as cardCzar
    room.activate(user);
    createTimer('player', Room.PLAYER_TIME, room);
    cb();
    socket.broadcast.to(room.id).emit('start game', {cardCzar: user.nickname});
  });
}


function createTimer(type, timeLeft, room){
  room.timer = setInterval(timer, 1000);
  function timer(){
    io.sockets.in(room.id).emit('tick', timeLeft);
    timeLeft--;
    if (timeLeft < 0){
      clearInterval(room.timer);
      if (type === 'player'){
        io.sockets.in(room.id).emit('all cards chosen', room.cardCzar.nickname);
        createTimer('card czar', Room.CARDCZAR_TIME, room);
      } else if (type === 'card czar'){
        io.sockets.in(room.id).emit('no winner chosen', room.cardCzar.nickname);
      }
    }
  }
}

function handleCardChoosing(socket, user, room){
  socket.on('card chosen', function(card, cb){
    user.cardChosen = card;
    room.numCardsChosen++;
    socket.broadcast.to(room.id).emit('card chosen', card);

    // all players have chosen except one (card czar)
    var allChosen = room.numCardsChosen === room.numPlayers()-1;
    if (allChosen){
      clearInterval(room.timer);
      createTimer('card czar', Room.CARDCZAR_TIME, room);
      io.sockets.in(room.id).emit('all cards chosen', room.cardCzar.nickname);
    }

    // draw new card
    decks.drawAnswer(room.id, 1, function(err, res){
      var cardInd = user.cards.indexOf(card);
      user.cards[cardInd] = res[0];
      cb({newCard: res[0], allChosen: allChosen});
    });
  });
}

function handleChoosingWinningCards(socket, user, room){
  socket.on('winning card', function(card, cb){
    
  });
}
