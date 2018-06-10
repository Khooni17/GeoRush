const messageModel = require('./models/message');
const LobbyModel = require('./models/lobby');

module.exports = (io) => {
  io.on('connection', (socket) => {

    socket.on('getCreatedLobbies', () => {
      LobbyModel.find({status: 'created'})
        .then(lobbies => {
          socket.emit('createdLobbies', lobbies);
        })
        .catch( (err) => {
          socket.emit('createdLobbies', []);
        });
    } );

    // создание лобби
    socket.on('createLobby', (lobbyInfo) => {
      socket.emit('lobbyCreated', lobbyInfo);   // для создателя
      socket.broadcast.emit('newLobby', lobbyInfo);  // для остальных
      LobbyModel.create({
        ...lobbyInfo,
        status: 'created'
      },
        (err) => {
        if(err){
          return console.error(err);
        }
      });
    });

    // начальная информация о лобби в превью
    socket.on('getLobbyInfo', (lobbyID) => {
      //console.log('semdded');
      LobbyModel.findOne({ lobbyID: lobbyID })
        .then( (res) => {
          console.log();
          io.emit('lobbyInfo', res);
        })
        .catch( (err) => {
          console.error("LobbyModel", err);
        })
    });

    // количество людей в превью и лобби
    socket.on('getCountPeopleInLobby', (lobbyID) => {
      const alreadyConnected = io.nsps['/'].adapter.rooms[lobbyID] ?
        Object.keys(io.nsps['/'].adapter.rooms[lobbyID].sockets) : [];
      socket.emit('CountPeopleInLobby', alreadyConnected);
    });

    // подкобчение к лобби
    socket.on('connectLobby', (lobbyInfo) => {

      const alreadyConnected = io.nsps['/'].adapter.rooms[lobbyInfo.lobbyID] ?
        Object.keys(io.nsps['/'].adapter.rooms[lobbyInfo.lobbyID].sockets) : [];
      // сначала проверка есть ли места
      if( alreadyConnected.length ===  lobbyInfo.countPlayers) {
        socket.emit('lobbyFilled');
      }
      else {
        socket.join(lobbyInfo.lobbyID);   // пропуск в комнату

        // проверка пора ли скрывать комнату
        if(alreadyConnected.length + 1 === lobbyInfo.countPlayers){
          setTimeout(() => {
            io.emit('hideRoom', lobbyInfo.lobbyID)
          }, 3000);
        }
      }

      const fullLobbyInfo = {
        ...lobbyInfo,
        UserID: socket.id
      };

      //console.log(fullLobbyInfo);

      io.emit('connectSuccess', fullLobbyInfo);  // для меня

      socket.broadcast.emit('addUserToReviewLobby', fullLobbyInfo);  // для остальных
      socket.to(lobbyInfo.lobbyID).emit('addUserToLobby', fullLobbyInfo);  // для лобби

      //  connectSuccess  (для меня)
      //  AddUser(lobbyInfo)  для группы и из инфо беру и делаю месседж





   /*   // добавление в список внутри комнаты

      io.sockets.in(roomInfo.lobbyID).emit('newGuest', alreadyConnected);

      //
      const countConnections = io.nsps['/'].adapter.rooms[roomInfo.lobbyID].length;


      console.log(countConnections);


      // добавление в спикок в ревью
      io.emit('pLus1connect', {
        id: socket.id,
        lobby: roomInfo.lobbyID
      });
      //  закрытие комнаты

    });

    // сообщение в лобби



    // новый показ комнаты если последний челик ливанул
    socket.on('showRoom', (roomInfo) => {
      const countPlayers = 3;

      const alreadyConnected = io.nsps['/'].adapter.rooms[roomInfo] ?
        Object.keys(io.nsps['/'].adapter.rooms[roomInfo].sockets) : [];
      const len = alreadyConnected.length;
      if(len === (countPlayers - 1)) {
        socket.broadcast.emit('showingRoom', roomInfo);
      }*/
    });

    //  отправка истории сообщений в лобби
    socket.on('getHistoryMessages', (lobbyID) => {
      messageModel.find({lobbyID: lobbyID})
        .then( (messages) => {
          socket.emit('historyMessages', messages);
        })
        .catch( (err) => {
          socket.emit('historyMessages', []);
        });
    });

    //  отправление смс в лобби
    socket.on('sendMessageToLobby', (messageInfo) => {
      // прикручивание даты и id юзера
      const message = {
        ...messageInfo,
        username: socket.id,
        date: new Date()
      };

      // отправка в бд, и если отправилось отправляется на клиент
      messageModel.create(message, (err) => {
        if(!err) {
          io.sockets.in(messageInfo.lobbyID).emit('newMessageInLobby', message);
        }
      });
    });

    // отключение челика
    socket.on('disconnect',  () => {

      //  идет отсылка в лобби и превью
      socket.broadcast.emit('leaveSocket', socket.id);

      // отнимание 1 челика из лобби превью
      //io.emit('minus1connect', socket.id);
    });


  });
};
