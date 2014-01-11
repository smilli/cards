
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
  var userId = req.session.userId;

  if (visitedRoom.active) {
    // user was already in game before & is reconnecting
    if (userRoomId === visitedRoomId && visitedRoom.hasBeenInRoom(userId)) {
      res.render('game', {title: 'Cards Against Humanity', url: BASE_URL+req.path, active: true});
    // no users can join after a game has begun
    } else {
      res.render('full', {title: 'Cards Against Humanity', msg: 'Sorry, this game has already begun!'});
    }
  } else {
    // cannot join a room if you're already in one (even if it's inactive)
    if (visitedRoomId !== userRoomId && userRoom && userRoom.hasBeenInRoom(userId)) {
      res.render('full', {title: 'Cards Against Humanity', msg: 'You\'re already in another game!'});
    // checks if room is already full
    // & if userId is not in room (for refreshes where user hasn't been deleted yet)
    } else if (!visitedRoom.isInRoom(userId) && visitedRoom.isFull()) {
      res.render('full', {title: 'Cards Against Humanity', msg: 'Sorry, this game is already full!'});
    // there are 3 players in room
    } else if (visitedRoom.canBeActivated()) {
      res.render('game', {title: 'Cards Against Humanity', active: false});
    // there are 2 players & user hasn't refreshed
    } else if (visitedRoom.numPlayers() === Room.MIN_PLAYERS - 1 && !visitedRoom.isInRoom(userId)){
      console.log('not in room yet');
      res.render('game', {title: 'Cards Against Humanity', active: false});
    } else {
      res.render('game', {title: 'Cards Against Humanity', url: BASE_URL+req.path, active: false});
    }
  }
};