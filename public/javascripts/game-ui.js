function divEscapedContentElement(message) {
  return $('<div></div>').text(message);
}

function divSystemContentElement(message) {
  return $('<div></div>').html('<i>' + message + '</i>');
}

var socket = io.connect();

function calcCardHeight(){
  var cardWidth = $('.card:first').width();
  var cardHeight = cardWidth * 1.2;
  return cardHeight;
}


$(document).ready(function() {
  var game;

  $(window).resize(function() {
    cardHeight = calcCardHeight();
    $('.card').attr("style", "height: " + cardHeight + "px;");
  });

  socket.on('connect', function(){
    socket.emit('init', {url: document.URL});
  });

  // after server checks to make sure this is a valid room
  socket.on('init', function(data){
      game = new Game(socket, data.name, data.roomId, data.isCardCzar, data.cardChosen);
      game.cards = data.cards;
      game.question = data.question;
      if (data.active) {
        displayCards(data.cards);
        updateQuestion(data.question);
      } 
      displayCards(data.cards); // for testing REMOVE later
      displayUsers(data.users);
      // If the user is the third person to enter
      $('#start').click(activateGame);
  });

  function displayCards(cards){
    console.log(cards);
    var $cards = $('#cards .card');
    if (cards.length !== $cards.length) {
      throw new Error('Number of cards received does not match number of cards on page');
    }
    $.each($('#cards .card'), function(ind, element){
      $(element).text(cards[ind]);
      $(element).height(calcCardHeight());
    });

    if (!game.cardChosen) {
      attachCardClickHandler();
      // Remove no-hover class
    }
  }

  function attachCardClickHandler(){
    $('#cards .card').click(function(e){
      if (!game.chosen && !game.isCardCzar){
        var card = $(this);
        game.chosen = $(this).text();
        console.log(game.chosen);
        socket.emit('card chosen', game.chosen, function(data){
          addChosenCard(game.chosen);
          card.html(data.newCard);
          $('#cards').addClass('no-hover');
          if (!data.allChosen){
            $('#desc-msg').text('Waiting for other players to choose!');
          }
        });
      }
    });
  }

  // update the current question
  socket.on('current question', updateQuestion);

  function updateQuestion(question){
    $('#question-card').html(question.text);
    game.numToChoose = question.choose;
    displayDescription(question);
  }

  function displayDescription(question){
    var desc;
    if (game.isCardCzar){
      desc = 'You are the card czar!  Waiting for players to choose their cards.'
    } else {
      if (game.chosen) {
        desc = 'Waiting for other players to choose!'
      } else {
        // if you haven't chosen display how many you can choose
        if (question.choose==1) {
          desc = 'Choose one card!'
        } else if (question.choose==2) {
          desc = 'Choose two cards!'
        }
      }
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
    console.log('can activate yo');
    $('#right-header').html('Ready to begin? <button id="start">START</button>');
    // what about for when it is active right off the bat?
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
    if (message) {
      game.sendMessage(message); 
      $('#chat').append(divEscapedContentElement(game.name + ': ' + message));
      $('#chat').scrollTop($('#chat').prop('scrollHeight'));
      $('#message').val('');
    }
  });

  function activateGame(){
    socket.emit('start game', function(){
      game.isCardCzar = true;
      $('#desc-msg').text('You are the card czar!  Waiting for players to choose their cards.')
      $('#fade').hide();
      $('#overlay').hide();
      $('#cards').addClass('no-hover');
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

  socket.on('card chosen', function(card){
    addChosenCard(card);
  });

  function addChosenCard(card){
    var cardHeight = calcCardHeight();
    $('#chosen-cards').append('<div class="card" style="height: ' + cardHeight + ';">' + card + '</div>');
  }

  socket.on('all cards chosen', function(cardCzar){
    $('#cards').hide();
    $('#chosen-cards').show();
    if (game.isCardCzar){
      $('#desc-msg').html('Choose the winning card!')
      $('#chosen-cards .cards').click(chooseWinningCard);
      $('#chosen-cards').removeClass('no-hover');
    } else {
      console.log(cardCzar);
      $('#desc-msg').html('Waiting for ' + cardCzar + ' to choose!');
    }
  });

  function chooseWinningCard(e){
    var card = $(this);
  }

  function showWinningCard(){

  }

});