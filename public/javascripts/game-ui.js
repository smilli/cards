function divEscapedContentElement(message) {
  return $('<div></div>').text(message);
}

function divSystemContentElement(message) {
  return $('<div></div>').html('<i>' + message + '</i>');
}

var socket = io.connect();

$(document).ready(function() {
  var game;

  socket.on('connect', function(){
    socket.emit('init', {url: document.URL});
  });

  // after server checks to make sure this is a valid room
  socket.on('init', function(data){
      game = new Game(socket, data.name, data.roomId);
      displayCards(data.cards);
      updateQuestion(data.question);
      displayUsers(data.users);
      console.log('initialized')
  });

  function displayCards(cards){
    var html = '';
    for (var i = 0; i < cards.length; i++){
      html += '<div class="card">' + cards[i] + '</div>';
    }
    $('#game').append(html);

    $('.card').click(function(e){
      if (!game.chosen && !game.wordCzar){
        var card = $(this);
        game.chosen = $(this).text();
        console.log(game.chosen);
        socket.emit('card chosen', game.chosen, function(newCard){
          $('#desc-msg').text('Waiting for other players to choose!');
          console.log(newCard);
          card.html(newCard);
        });
      }
    });
  }

  // update the current question
  socket.on('current question', updateQuestion);

  function updateQuestion(question){
    $('#questionCard').html(question.text);
    game.numToChoose = question.choose;
    if(question.choose==1){
      var desc = 'Choose one card!'
    } else if (question.choose==2) {
      var desc = 'Choose two cards!'
    }
    $('#desc-msg').html(desc);
  }

  socket.on('new user', displayUsers);

  function displayUsers(users){
    var html = '';
    for (var i=0; i < users.length; i++){
      html += '<li id="user' + users[i].id + '">' + users[i].nickname + '</li>';
    }
    $('#users').append(html);
  }

  socket.on('remove user', removeUser);

  function removeUser(user){
    console.log(user);
    $('#user' + user.id).remove();
  }

  // min number of players achieved
  socket.on('can activate game', function(){
    $('#overlay').html('<button id="start">START</button>');
    $('#start').click(activateGame);
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

  // when user clicks start game button
  $('#start').click(activateGame);

  function activateGame(e){
    e.preventDefault();
    socket.emit('start game', function(){
      $('#desc-msg').text('You are the word czar!  Waiting for players to choose their cards.')
      $('#fade').hide();
      $('#overlay').hide();
      game.wordCzar = true;
    });
  }

  socket.on('start game', function(){
    $('#fade').hide();
    $('#overlay').hide();
  });

  socket.on('tick', function(time){
    var minutes = Math.floor(time/60);
    var seconds = time % 60;
    if (seconds==0) {
      seconds = '00';
    } else if (seconds < 10){
      seconds = '0' + seconds;
    }
    $('#timer').html(minutes+':'+seconds);
  });

});