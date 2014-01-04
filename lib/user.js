module.exports = User;

function User(roomId){
	this.roomId = roomId;
	this.nickname = 'Guest' + User.guestNumber;
	User.guestNumber++;
}

User.guestNumber = 1;

User.prototype.changeNick = function(newNick){
	this.nickname = newNick;
}