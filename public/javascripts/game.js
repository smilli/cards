var Game = function(socket, name, roomId, isCardCzar, chosen) {
  this.socket = socket;
  this.name = name;
  this.numToChoose = null;
  this.isCardCzar = isCardCzar;
  this.chosen = chosen;
  this.roomId = roomId;
};

Game.prototype.sendMessage = function(message) {
  this.socket.emit('message', message);
};