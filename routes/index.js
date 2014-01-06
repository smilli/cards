
/*
 * GET home page.
 */

var BASE_URL = 'http://localhost:3000';
var Room = require('./../lib/room');

exports.index = function(req, res){
  res.render('index', { title: 'Cards Against Humanity' });
};

exports.game = function(req, res){
  var roomId = parseInt(req.params.roomId);
  var room = Room.getRoom(roomId);
  if (room.active) {
    res.render('full', {title: 'Cards Against Humanity', msg: 'Sorry, this game has already begun!'});
  } else if (room.isFull()) {
    res.render('full', {title: 'Cards Against Humanity', msg: 'Sorry, this game is already full!'});
  } else if (room.numPlayers() >= 2) { // need to make sure this is a new user & not one that's just refreshing
    res.render('game', {title: 'Cards Against Humanity'});
  } else {
    res.render('game', {title: 'Cards Against Humanity', url: BASE_URL+req.path});
  }
};