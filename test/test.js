var assert = require('assert');
var should = require('should');
var request = require('request');
var io = require('socket.io-client');
var Room = require('./../lib/room');
var decks = require('./../lib/decks');
var gameServer = require('./../lib/game-server');

var BASE_URL = 'http://localhost:3000'

describe('game server', function(){

  describe('#createNewRoom()', function(){
    it('should create a new room', function(done){
      var lastRoomId = Room.latestRoomId;
      request = request.post(BASE_URL + '/addGame', function(err, res, body){
        if (err) done(err);
        var currentRoomId = Room.latestRoomId;
        console.log(lastRoomId + ' ' + currentRoomId);
        assert.equal(lastRoomId, currentRoomId-1);
        done();
      });
    });
  });

  describe('#initializeConnections()', function(){
  });

  describe('#handleGameActivation()', function(){
      it('should allow game activation when 3 users connect', function(){
      var roomId = 1
      var room = Room.getRoom(roomId);
      var client1 = io.connect(BASE_URL + '/' + roomId);
      var client2 = io.connect(BASE_URL + '/' + roomId);
      var client3 = io.connect(BASE_URL + '/' + roomId);

      assert.strictEqual(room.canBeActivated(), true);

    });
  });
});

describe('decks', function(){ 
  decks.init();
  var roomId = 1;

  describe('#addToRoom()', function(){
    it('should set a current question for the room', function(done){
      decks.addToRoom(roomId, checkCurrQuestion);
      function checkCurrQuestion(){
        decks.getCurrQuestion(roomId, function(err, res){
          if (err) throw err;
          done();
        });
      }
    });
  });
});