var Game = function(socket, name, roomId) {
  this.socket = socket;
  this.name = name;
  this.roomId = roomId;
};

Game.prototype.sendMessage = function(message) {
  this.socket.emit('message', message);
};


