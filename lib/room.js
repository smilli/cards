var decks = require('./decks');
var User = require('./user');

module.exports = Room;

function Room(){
  this.id = ++Room.latestRoomId;
  this.latestUserId = 0;
  this.currQuestion = '';
  this.numCardsChosen = 0;
  // maps userId to user
  this.users = {};
  this.inactiveUsers = {};
  this.userInd = 0;
  this.active = false;
  this.cardCzar = null;
  Room.rooms[this.id] = this;
  this.timer = null;
}

Room.rooms = {};
Room.latestRoomId = 0;
Room.MAX_PLAYERS = 10;
Room.MIN_PLAYERS = 3;
Room.PLAYER_TIME = 30;
Room.CARDCZAR_TIME = 60 * 3;

// need to delete rooms that aren't active
Room.getRoom = function(roomId){
  return Room.rooms[roomId];
}

Room.prototype.numPlayers = function(){
  return Object.keys(this.users).length;
}

Room.prototype.isFull = function(){
  return Object.keys(this.users).length >= Room.MAX_PLAYERS;
}

Room.prototype.canBeActivated = function(){
  return Object.keys(this.users).length >= Room.MIN_PLAYERS;
}

Room.prototype.activate = function(user){
  this.active = true;
  this.cardCzar = user;
  console.log(this.cardCzar);
  this.userInd = Object.keys(this.users).indexOf(user.id);
}

Room.prototype.deactivate = function(){
  this.active = false;
  this.cardCzar = null;
  this.userInd = 0;
}

Room.prototype.destroy = function(){
  delete Room.rooms[this.roomId];
  decks.deleteDecks(this.roomId);
}

Room.prototype.pickNextcardCzar = function(){
  this.userInd++;
  userIds = Object.keys(this.users);
  if (this.userInd >= userIds.length) this.userInd = 0;
  this.cardCzar = this.users[users[this.userInd]];
  return this.cardCzar;
}

Room.prototype.addNewUser = function(){
  var id = this.latestUserId++;
  this.users[id] = new User(id);
  console.log(Object.keys(this.users).length);
  return this.users[id];
}

Room.prototype.deactivateUser = function(userId){
  this.inactiveUsers[userId] = this.users[userId];
  delete this.users[userId];
}

Room.prototype.removeUser = function(userId){
  delete this.users[userId];
}

Room.prototype.getUserName = function(userId){
  return this.users[userId].nickname;
}

Room.prototype.isInRoom = function(userId){
  return userId in this.users;
}

// Returns true if user is or has been in the room before
Room.prototype.hasBeenInRoom = function(userId){
  return this.users[userId] || this.inactiveUsers[userId];
}

Room.prototype.getAllNames = function(userId){
  names = [];
  for (user in this.users){
    names.push(user.nickname);
  }
  return names
}

Room.prototype.setUserName = function(currUser, newName, cb){
  if (newName.indexOf('Guest') == 0){
    return cb('Names cannot begin with "Guest".');
  }
  for (user in this.users){
    if (user.nickname == newName){
      return cb('That name is already taken.');
    }
  } 
  currUser.changeNick(newName);
  return cb(null, this.getAllNames());
}

/*Room.prototype.startPlayerTimer = function(io){
  this.playerTimer = setInterval(timer, 1000);
  var timeLeft = Room.PLAYER_TIME;
  function timer(){
    io.sockets.in(this.id).emit('tick', timeLeft);
    timeLeft--;
    if (timeLeft < 0){
      clearInterval(this.playerTimer);
      console.log(this.cardCzar);
      io.sockets.in(this.id).emit('all cards chosen', this.cardCzar.nickname);
    }
  }
}

Room.prototype.endPlayerTimer = function(){
  clearInterval(this.playerTimer);
  this.playerTimer = null;
}

Room.prototype.startCardCzarTimer = function(io){
  this.cardCzarTimer = setInterval(timer, 1000);
  function timer(){
    io.sockets.in(this.id).emit('tick', timeLeft);
    timeLeft--;
    if(timeLeft < 0){
      clearInterval(this.cardCzarTimer);
      io.sockets.in(this.id).emit('no winner chosen', this.cardCzar.nickname);
    }
  }
}

Room.prototype.endCardCzarTimer = function(){

}*/