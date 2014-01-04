exports.sendMessage = function(){
	socket.broadcast.to(users[socket.id].roomId).emit()
}