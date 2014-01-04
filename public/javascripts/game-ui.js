function divEscapedContentElement(message) {
  return $('<div></div>').text(message);
}

function divSystemContentElement(message) {
  return $('<div></div>').html('<i>' + message + '</i>');
}

var socket = io.connect();

$(document).ready(function() {
  var game;

  socket.on('init', function(data){
      game = new Game(socket, data.name, data.roomId);
      console.log('initialized')
  });

  socket.on('message', function(message){
    $('#chat').append(divEscapedContentElement(message));
  })

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