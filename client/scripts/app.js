// YOUR CODE HERE:

var app = {
};

app.init = function () {
  $( document ).ready(function() {
    $('#send').on('click', '.submit', app.handleSubmit);

    $('#rooms').on('click', '.newRoom', app.renderRoom);

    $('.roomSelect').change(app.displayMessages);

    $('#message').bind('keypress', function(e) {
      if ((e.which > 32 && e.which < 48) || 
        (e.which > 57 && e.which < 65) || 
        (e.which > 90 && e.which < 97) ||
        e.which > 122) {
        e.preventDefault();
      }
    }); 
    $('#room').bind('keypress', function(e) {
      if ((e.which > 32 && e.which < 48) || 
        (e.which > 57 && e.which < 65) || 
        (e.which > 90 && e.which < 97) ||
        e.which > 122) {
        e.preventDefault();
      }
    }); 
  });
  window.friends = [];
  setInterval(app.fetch, 1000);
};

app.send = function (message) {

  $.ajax({
    url: 'https://api.parse.com/1/classes/messages',
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: function (data) {
      console.log('chatterbox: Message sent');
      console.log(data);
    },
    error: function (data) {
      // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to send message', data);
    }
  });

};

app.fetch = function () {
  $.ajax({
    url: 'https://api.parse.com/1/classes/messages',
    type: 'GET',
    data: {order: '-createdAt'},
    contentType: 'application/json',
    success: function (data) {
      console.log('chatterbox: Message received');
      window.allMsgs = data.results;
      app.displayMessages();
      app.displayRooms();
      $('.username').on('click', app.handleUsernameClick);
      window.friends.forEach(function(friend) {
        $('.' + friend).css('font-weight', 'bolder');
      });
    },
    error: function (data) {
      // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to receive message', data);
    }
  });
};

app.server = 'https://api.parse.com/1/classes/messages'; // revisit

app.clearMessages = function () {
  $('#chats').empty();
};

app.renderMessage = function (message) {

  var $message = $('<div class="message"><hr></div>');
  var $username = $('<span class="username ' + message.username + '"></span>');
  var $text = $('<div class="text"></div>');
  var $roomname = $('<div class="roomname"></div>');
  $username.text(message.username + ':');
  $text.text(message.text);
  $roomname.text(message.roomname);
  $username.appendTo($message);
  $text.appendTo($message);
  $roomname.appendTo($message);
  $message.appendTo($('#chats'));

};

app.renderRoom = function () {
  var roomName = $('#room').val();
  var $roomname = $('<option class="' + roomName + '"></option>');
  $roomname.text($('#room').val());
  $roomname.appendTo($('.roomSelect'));
};

app.handleUsernameClick = function () {
  var specificUser = this.classList;
  window.friends.push(specificUser[1]);
  $('.' + specificUser[1]).css('font-weight', 'bolder');
};

app.handleSubmit = function () {
  var message = {
    username: window.location.search ? window.location.search.slice(10) : 'anonymous',
    text: $('#message').val(),
    roomname: $('.roomSelect').val() ? $('.roomSelect').val() : 'lobby'
  };
  app.send(message);
};

app.displayMessages = function() {
  app.clearMessages();
  window.allMsgs.forEach(function(message) {
    if (message.roomname === $('.roomSelect').val()) {
      app.renderMessage(message);
    }
  });
};

app.displayRooms = function() {
  var roomNames = {};
  var existingRooms = {};
  document.getElementById('rooms').childNodes[3].childNodes.forEach(function (name) {
    existingRooms[name.className] = name.className;
  });
  window.allMsgs.forEach(function(message) {
    if (!(message.roomname in existingRooms)) {
      roomNames[message.roomname] = message.roomname;
    }
  });
  for (var key in roomNames) {
    var $roomname = $('<option class="' + key + '"></option>');
    $roomname.text(key);
    $roomname.appendTo($('.roomSelect'));
  }
};

app.init();

