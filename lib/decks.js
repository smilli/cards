var fs = require('fs');
var csv = require('csv');
var redis = require('redis');
var client = redis.createClient();


client.on('error', function (err) {
  throw err;
});

// saves original decks in redis
// room-specific decks are copied from these "master decks"
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
  .from.path(__dirname+'/cah2.csv', { delimiter: ',', escape: '"' })
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

exports.addToRoom = function(roomId){
  client.multi()
    .sunionstore('room:'+roomId+':answers', 'answers')
    .sunionstore('room:'+roomId+':questions', 'questions')
    .exec();
}

// drawQuestion & drawAnswer won't work properly right now
// just a mock up

exports.drawQuestion = function(roomId){
  client.spop('room:'+roomId':questions', function(err, res){
    var numAnswerCards = number(res.charAt[0]);
    var question = {
      text: res.substring[1],
      choose: numAnswerCards
    };
    return question;
  })
}

exports.drawAnswer = function(roomId, numCards){
  var multi = client.multi();
  for (var i = 0; i < numCards.length; i++){
    multi.spop('room:'+roomId':answers');
  }
  multi.exec(function (err, res){
    return res;
  });
}