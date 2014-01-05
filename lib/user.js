module.exports = User;

function User(){
	this.nickname = 'Guest' + User.guestNumber;
	User.guestNumber++;
	console.log('user added');
}

User.guestNumber = 1;

User.prototype.changeNick = function(newNick){
	this.nickname = newNick;
}