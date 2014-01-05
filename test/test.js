var assert = require('assert');
var Browser = require('zombie');
var decks = require('./../lib/decks.js');
var gameServer = require('./../lib/game-server.js');

var BASE_URL = 'http://localhost:3000/'

describe('game server', function(){
  var browser;

  before(function(done){
    browser = new Browser();
    browser
      .visit(BASE_URL + '1')
      .then(done, done)
  });

  it('should not receive a response', function(){
    assert.equal(browser.text(), '');
  });

  before(function(done){
    browser
      .visit(BASE_URL)
      .then(function(){
        browser.pressButton('#new-game');
      })
      .then(done, done);
  });

  // this is not currently working
  it('should create a new game', function(){
    console.log('new game');
    console.log(browser.location);
    assert.notEqual(browser.text(), '');
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