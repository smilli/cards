var decks = require('./decks');
var User = require('./user');

module.exports = Room;

function Room(roomId){
	this.id = roomId;
	// maps socketId to user
	this.users = {};
	this.nameInd = 0;
	this.active = false;
	this.wordCzar = null;
	Room.rooms[roomId] = this;
}

Room.rooms = {};

// need to delete rooms that aren't active
Room.getRoom = function(roomId){
	return Room.rooms[roomId];
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

Room.prototype.addNewUser = function(socketId){
	this.users[socketId] = new User();
}

Room.prototype.removeUser = function(socketId){
	delete this.users[socketId];
}

Room.prototype.getUserName = function(socketId){
	return this.users[socketId].nickname;
}

Room.prototype.getAllNames = function(socketId){
	names = [];
	for (user in users){
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