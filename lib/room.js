var decks = require('./decks');
var User = require('./user');

module.exports = Room;

function Room(){
  this.id = ++Room.latestRoomId;
  // maps socketId to user
  this.users = {};
  this.inactiveUsers = {};
  this.nameInd = 0;
  this.active = false;
  this.wordCzar = null;
  Room.rooms[this.id] = this;
}

Room.rooms = {};
Room.latestRoomId = 0;

// need to delete rooms that aren't active
Room.getRoom = function(roomId){
  return Room.rooms[roomId];
}

Room.MAX_PLAYERS = 10;
Room.MIN_PLAYERS = 3;


Room.prototype.numPlayers = function(){
  return Object.keys(this.users).length;
}

Room.prototype.isFull = function(){
  return Object.keys(this.users).length >= Room.MAX_PLAYERS;
}

Room.prototype.canBeActivated = function(){
  return Object.keys(this.users).length >= Room.MIN_PLAYERS;
}

Room.prototype.activate = function(){
  this.active = true;
  this.wordCzar = this.users[this.nameInd];
  this.nameInd++;
}

Room.prototype.deactivate = function(){
  this.active = false;
  this.wordCzar = null;
  this.nameInd = 0;
}

Room.prototype.destroy = function(){
  delete Room.rooms[this.roomId];
  decks.deleteDecks(this.roomId);
}

Room.prototype.pickNextWordCzar = function(){
  if (this.nameInd >= this.users.length) this.nameInd = 0;
  this.wordCzar = this.user[this.nameInd];
  return this.wordCzar;
}

Room.prototype.addNewUser = function(socket){
  this.users[socket.id] = new User();
  console.log(Object.keys(this.users).length);
}

Room.prototype.deactivateUser = function(socketId){
  this.inactiveUsers[socketId] = this.users[socketId];
  delete this.users[socketId];
}

Room.prototype.removeUser = function(socketId){
  delete this.users[socketId];
}

Room.prototype.getUserName = function(socketId){
  return this.users[socketId].nickname;
}

Room.prototype.isInRoom = function(socketId){
  return socketId in this.users;
}

// Returns true if user is or has been in the room before
Room.prototype.hasBeenInRoom = function(socketId){
  return this.users[socketId] || this.inactiveUsers[socketId];
}

Room.prototype.getAllNames = function(socketId){
  names = [];
  for (user in this.users){
    names.push(user.nickname);
  }
  return names
}

Room.prototype.setUserName = function(socketId, newName, cb){
  if (newName.indexOf('Guest') == 0){
    return cb('Names cannot begin with "Guest".');
  }
  for (user in this.users){
    if (user.nickname == newName){
      return cb('That name is already taken.');
    }
  } 
  this.users[socketId].changeNick(newName);
  return cb(null, this.getAllNames());
}