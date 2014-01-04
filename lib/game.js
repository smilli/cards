module.exports = Game;

function Game(GameId){
  this.id = GameId;
  this.nicknames = [];
  this.questionCards = Game.questionCards;
  this.answerCards = Game.answerCards;
}

Game.questionCards = []
Game.answerCards = [];

Game.prototype.dealCard(isAnswerCard){
  var deck = (isAnswerCard)
    ? this.questionCards
    : this.answerCards; 
  var ind = Math.floor((Math.random()*deck.length));
  var card = deck[ind];
  deck.splice(ind, 1);
  return card;
}

Game.prototype.addUser(nickname){
  Game.nicknames.push(nickname);
}