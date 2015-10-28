// TODO: find out why success isn't logging, but the test is passing.

var app;
$(function () {
// Helper functions
  var entityMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;',
    "'": '&#39;',
    "/": '&#x2F;'
  };

  function escapeHtml(string) {
    return String(string).replace(/[&<>"'\/]/g, function (s) {
      return entityMap[s];
    });
  }

  app = {};
  // app.server = "https://api.parse.com/1/classes/chatterbox"
  app.server = '127.0.0.1:3000/classes/chatterbox';
  // app.server = '127.0.0.1:3000/';
  app.username = 'h4x0r bob';
  app.roomname = 'lobby';
  app.friends = {};


  app.init = function () {
    app.$roomSelect = $('#roomSelect');
    //console.log("fetch calle in init");
    app.fetch();
    //console.log("fetch called in init");

    app.$roomSelect.on('change', app.saveRoom);
    $('.submit').on('click', app.handleSubmit);
    $('#main').on('click', '.username', app.addFriend);

    // Turn on for auto update
    // setInterval(app.fetch, 3000);

  };

  app.send = function (data) {
    $.ajax({
      url: app.server,
      type: 'POST',
      data: JSON.stringify(data),
      // may need content type
      contentType: 'application/json',
      success: function (data) {
        console.log('chatterbox: Message sent. Data: ', data);
        app.fetch();
      },
      error: function (data) {
        console.error('chatterbox: Failed to send message. Error: ', data);
      }
    });
  };

  app.fetch = function (data) {
    //console.log("fetch called");
    $.ajax({
      url: app.server,
      type: 'GET', // the request method
      // data: JSON.stringify(data),
      // data: {order: '-createdAt'},
      
      success: function (data) {
        // why is this not logging??
        console.log('chatterbox: Message sent. Data: ', data);
        // populate the rooms
        //app.populateRooms(data.results);
        // This is working on populating the page
        //app.populateMessages(data.results);
      },
      error: function (data) {
        console.error('chatterbox: Failed to send message. Error: ', data);
      }
    });
  };

  app.populateMessages = function (data) {
    app.clearMessages();

    data.forEach(function (val) {
      app.addMessage(val)
    })
  };

  app.populateRooms = function (results) {
    app.$roomSelect.html('<option val="__newRoom">New Room</option><option val="" selected>Lobby</option>')

    if (results) {
      var processedRooms = {};

      if (app.roomname !== 'lobby') {
        app.addRoom(app.roomname)
        processedRooms[app.roomname] = true;
      }


      results.forEach(function (data) {
        var roomname = data.roomname;
        if (roomname && !processedRooms[roomname]) {
          app.addRoom(roomname);
          processedRooms[roomname] = true;
        }
      })
      app.$roomSelect.val(app.roomname)
    }
  };

  app.clearMessages = function () {
    $('#chats').html('');
  };

  app.addMessage = function (message) {
    if (!message.roomname) {
      message.roomname = 'lobby';
    }

    // if we want to fix the test, just append the username and message instead of 
    // putting them in the div
    if (message.roomname === app.roomname) {
      var $chat = $('<div class="chat"/><span class="username">' + message.username + '</span class="username">: <br />' +
        escapeHtml(message.text) + '</div>')
        .attr('data-username', message.username)
        .attr('data-roomname', message.roomname)

      $('#chats').append($chat);

    }

    // $('#chats').append('<div class="chat"><span class="username">' + message.username + '</span
    // class="username">: <br/>' + escapeHtml(message.text) + '</div>')
  };

  app.addRoom = function (newRoom) {
    var $option = $('<option />').val(newRoom).text(newRoom)

    app.$roomSelect.append($option)
  };

  app.saveRoom = function (event) {
    var selectedIndex = app.$roomSelect.prop('selectedIndex');

    if (selectedIndex === 0) {
      var roomName = prompt('What would you like to name the room?');
      if (roomName) {
        app.roomname = roomName;
        app.addRoom(roomName);
        app.$roomSelect.val(roomName);
        app.fetch();
      }
    } else {
      app.roomname = app.$roomSelect.val();
      app.fetch();
    }
  };

  app.addFriend = function (event) {
    var username = $(event.currentTarget).attr('data-username');

    // if username !== undefined
    app.friends[username] = true;
    console.log('You are friends with %s', username);
    var selector = '[data-username="' + username.replace(/"g/, '\\\"') + '"]'
    $(selector).addClass('friend')
  };

  app.handleSubmit = function (event) {
    event.preventDefault();
    console.log("Was submitted.");

    var message = {
      username: app.username,
      roomname: app.roomname || 'lobby',
      text: $('#message').val()
    };

    app.send(message)
  };

  app.init();
  return app;
});

