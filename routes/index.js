
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
    // if you refresh room will be full even if you just joined
  } else if (room.isFull()) {
    res.render('full', {title: 'Cards Against Humanity', msg: 'Sorry, this game is already full!'});
  } else {
    res.render('game', {title: 'Cards Against Humanity', url: BASE_URL+req.path});
  }
};