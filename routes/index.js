
/*
 * GET home page.
 */

var BASE_URL = 'http://localhost:3000';
var Room = require('./../lib/room');

exports.index = function(req, res){
  res.render('index', { title: 'Cards Against Humanity' });
};

exports.game = function(req, res){
  var visitedRoomId = parseInt(req.params.roomId);
  var visitedRoom = Room.getRoom(visitedRoomId);
  var userRoomId = req.session.roomId;
  var userRoom = Room.getRoom(userRoomId);
  var socketId = req.session.socketId;

  if (visitedRoom.active) {
    // user was already in game before & is reconnecting
    if (userRoomId === visitedRoomId && visitedRoom.hasBeenInRoom(socketId)) {
      res.render('game', {title: 'Cards Against Humanity', url: BASE_URL+req.path});
    // no users can join after a game has begun
    } else {
      res.render('full', {title: 'Cards Against Humanity', msg: 'Sorry, this game has already begun!'});
    }
  } else {
    // cannot join a room if you're already in one
    if (visitedRoomId !== userRoomId && userRoom && userRoom.active && userRoom.hasBeenInRoom(socketId)) {
      res.render('full', {title: 'Cards Against Humanity', msg: 'You\'re already in another game!'});
    // checks if room is already full
    // & if socketId is not in room (for refreshes where user hasn't been deleted yet)
    } else if (!visitedRoom.isInRoom(socketId) && visitedRoom.isFull()) {
      res.render('full', {title: 'Cards Against Humanity', msg: 'Sorry, this game is already full!'});
    // there are 3 players in room
    } else if (visitedRoom.canBeActivated()) {
      res.render('game', {title: 'Cards Against Humanity'});
    // there are 2 players & user hasn't refreshed
    } else if (visitedRoom.numPlayers() === Room.MIN_PLAYERS - 1 && !visitedRoom.isInRoom(socketId)){
      res.render('game', {title: 'Cards Against Humanity'});
    } else {
      res.render('game', {title: 'Cards Against Humanity', url: BASE_URL+req.path});
    }
  }
};