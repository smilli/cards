module.exports = User;

function User(){
	this.nickname = 'Guest' + User.guestNumber;
	this.cardsWon = [];
	User.guestNumber++;
	console.log('user added');
}

User.guestNumber = 1;

User.prototype.changeNick = function(newNick){
	this.nickname = newNick;
}

User.prototype.numCardsWon = function(){
	return this.cardsWon.length;
}