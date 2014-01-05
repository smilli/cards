var assert = require("assert");
var decks = require("./../lib/decks.js");

describe('Decks', function(){
  decks.init();
  var roomId = 1;

  describe('#addToRoom()', function(){
    it('should set a current question for the room', function(done){
      decks.addToRoom(roomId, checkCurrQuestion());
      function checkCurrQuestion(){
        decks.getCurrQuestion(roomId, function(err, res){
          if (err) throw err;
          done();
        })
      }
    })
  })

})