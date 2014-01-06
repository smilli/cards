function divEscapedContentElement(message) {
  return $('<div></div>').text(message);
}

function divSystemContentElement(message) {
  return $('<div></div>').html('<i>' + message + '</i>');
}

var socket = io.connect();

$(document).ready(function() {
  var game;

  // after server checks to make sure this is a valid room
  socket.on('init', function(data){
      game = new Game(socket, data.name, data.roomId);
      console.log('initialized')
  });

  // the original hand that is dealt to user
  socket.on('hand', function(cards){
    for (var i = 0; i < cards.length; i++){
      $('#game').append($('<div></div>', {"class": "card"}).html(cards[i]));
    }
  });

  // update the current question
  socket.on('current question', function(question){
    console.log(question);
    $('#questionCard').html(question.text);
  });

  // min number of players achieved
  socket.on('can activate game', function(){
    console.log('game is ready to be activated!');
    $('#overlay').html('<button id="start">START</button>');
  });

  // had min number but then someone disconnected
  socket.on('can not activate game', function(){
    $('#overlay').html('Waiting for at least three people!  <br/> Share this link with your friends:'
      + '<br/><span id="link">' + document.URL + '</span>');
  })

  // receiving messages
  socket.on('message', function(message){
    $('#chat').append(divEscapedContentElement(message));
  });

  // submitting messages
  $('#message-form').submit(function(e){
    e.preventDefault();
    var message = $('#message').val();
    if(message){
      game.sendMessage(message); 
      $('#chat').append(divEscapedContentElement(game.name + ': ' + message));
      $('#chat').scrollTop($('#chat').prop('scrollHeight'));
      $('#message').val('');
    }
  });

});