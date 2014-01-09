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

Room.prototype.activate = function(user){
  this.active = true;
  this.wordCzar = user;
  this.userInd = Object.keys(this.users).indexOf(user.id);
}

Room.prototype.deactivate = function(){
  this.active = false;
  this.wordCzar = null;
  this.userInd = 0;
}

Room.prototype.destroy = function(){
  delete Room.rooms[this.roomId];
  decks.deleteDecks(this.roomId);
}

Room.prototype.pickNextWordCzar = function(){
  this.userInd++;
  userIds = Object.keys(this.users);
  if (this.userInd >= userIds.length) this.userInd = 0;
  this.wordCzar = this.users[users[this.userInd]];
  return this.wordCzar;
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