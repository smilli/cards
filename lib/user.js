module.exports = User;

function User(id){
	this.id = id; // same as original socket.id
	this.nickname = 'Guest' + User.guestNumber++;
	this.cards = []; // cards currently in hand
	this.cardChosen = null; // TODO: make sure to reset this after each round
	this.cardsWon = [];
	console.log('user added');
}

User.guestNumber = 1;

User.prototype.changeNick = function(newNick){
	this.nickname = newNick;
}

User.prototype.numCardsWon = function(){
	return this.cardsWon.length;
}