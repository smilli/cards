var fs = require('fs');
var csv = require('csv');
var redis = require('redis');
var client = redis.createClient();


client.on('error', function (err) {
  throw err;
});

// Saves original decks in redis
// Room-specific decks are copied from these "master decks"
exports.init = function(){
  client.multi()
    .exists('answers')
    .exists('questions')
    .exec(function(err, res){
      if (err || res[0]===0 || res[1]===0) {
        storeDeck();
      }
    });
}

function storeDeck(){
  var answers = ['answers'];
  var questions = ['questions'];
  
  csv()
  .from.path(__dirname+'/cah.csv', { delimiter: ',', escape: '"' })
  .transform( function(row) {
    if(row[0]=='Answers') {
      answers.push(row[1]);
      return row;
    } else if (row[0]=='Question') {
      // first char of each question is how many cards to choose
      var question = row[2] + row[1];
      questions.push(question);
      return row
    }
  })
  .on('end', function(count){
    client.multi()
      .sadd(answers)
      .sadd(questions)
      .exec();
  })
  .on('error', function(error){
    console.log(error.message);
  });
}

// Stores decks specific to a room
exports.addToRoom = function(roomId, cb){
  client.multi()
    .sunionstore('room:'+roomId+':answers', 'answers')
    .sunionstore('room:'+roomId+':questions', 'questions')
    .exec(function(){
      changeCurrQuestion(roomId, cb);
    });
}

exports.changeCurrQuestion = changeCurrQuestion;

function changeCurrQuestion(roomId, cb){
  client.spop('room:'+roomId+':questions', function(err, res){
    client.set('room:'+roomId+':currQuestion', res, function(err, res){
      if (cb) return cb(err, res);
    });
  })
}

exports.getCurrQuestion = function(roomId, cb){
  client.get('room:'+roomId+':currQuestion', function(err, res){
    var numAnswerCards = Number(res.charAt(0));
    var question = {
      text: res.substring(1),
      choose: numAnswerCards
    };
    return cb(err, question);
  })
}

exports.drawAnswer = function(roomId, numCards, cb){
  var multi = client.multi();
  for (var i = 0; i < numCards; i++){
    multi.spop('room:'+roomId+':answers');
  }
  multi.exec(function (err, res){
    return cb(err, res);
  });
}

exports.deleteDecks = function(roomId){
  client.multi()
    .del('room:'+roomId+':currQuestion')
    .del('room:'+roomId+':questions')
    .del('room:'+roomId+':answers')
    .exec();
}

exports.addToAnswerDeck = function(cards){
  var answers = ['answers'].concat(cards);
  client.sadd(answers);
}