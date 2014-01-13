var Game = function(socket, name, roomId, isCardCzar, chosen) {
  this.socket = socket;
  this.name = name;
  this.numToChoose = null;
  this.isCardCzar = isCardCzar;
  this.chosen = chosen;
  this.roomId = roomId;

  // only used to save at the beginning before game is active
  this.cards = [];
  this.question = null;
};
