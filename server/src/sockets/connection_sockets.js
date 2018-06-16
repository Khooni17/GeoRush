const messageModel = require('../models/message');
const LobbyModel = require('../models/lobby');
const questionModel = require('../models/question_model');
const https = require('https');

const _ = require('lodash');



module.exports = (io, socket) => {
  socket.on('getCreatedLobbies', () => {
    LobbyModel.find({status: 'created'})
      .then(lobbies => {
        /// map добавляет к каждому лобби игроков онлайн
        lobbies.map((lobby) => {
          const alreadyConnected = io.nsps['/'].adapter.rooms[lobby.lobbyID] ?
            Object.keys(io.nsps['/'].adapter.rooms[lobby.lobbyID].sockets) : [];
          lobby.players = alreadyConnected;
          return lobby;
        });

        socket.emit('createdLobbies', lobbies);
      })
      .catch((err) => {
        socket.emit('createdLobbies', []);
      });
  });

  socket.on('getLobbyByID', (lobbyID) => {
    LobbyModel.findOne({lobbyID: lobbyID})
      .then((lobbyInfo) => {
        socket.emit('lobbyByID', lobbyInfo);
      })
      .catch((err) => {
        socket.emit('lobbyByID', {});
      });
  });
  // создание лобби
  socket.on('createLobby', (lobbyInfo) => {
    const trueLobbyInfo = {
      ...lobbyInfo,
      status: 'created',
      players: []
    };

    socket.emit('lobbyCreated', trueLobbyInfo);   // для создателя
    socket.broadcast.emit('newLobby', trueLobbyInfo);  // для остальных
    LobbyModel.create(trueLobbyInfo, (err) => {
      if (err) {
        return console.error(err);
      }
    });
  });

  // начальная информация о лобби в превью
  socket.on('getLobbyInfo', (lobbyID) => {

    LobbyModel.findOne({lobbyID: lobbyID})
      .then((res) => {
        io.emit('lobbyInfo', res);
      })
      .catch((err) => {
        console.error("LobbyModel", err);
      })
  });

  // количество людей в превью и лобби
  socket.on('getCountPeopleInLobby', (lobbyID) => {
    const alreadyConnected = io.nsps['/'].adapter.rooms[lobbyID] ?
      Object.keys(io.nsps['/'].adapter.rooms[lobbyID].sockets) : [];
    socket.emit('CountPeopleInLobby', alreadyConnected);
  });

  socket.on('getCountPeopleInLobbyToListing', (lobbyID) => {
    const alreadyConnected = io.nsps['/'].adapter.rooms[lobbyID] ?
      Object.keys(io.nsps['/'].adapter.rooms[lobbyID].sockets) : [];
    socket.emit('CountPeopleInLobbyToListing', {
      players: alreadyConnected,
      lobbyID: lobbyID
    });
  });

  // подкобчение к лобби
  socket.on('connectLobby', (lobbyInfo) => {

    // сначала проверка есть ли места
    const alreadyConnected = io.nsps['/'].adapter.rooms[lobbyInfo.lobbyID] ?
      Object.keys(io.nsps['/'].adapter.rooms[lobbyInfo.lobbyID].sockets) : [];
    if (alreadyConnected.length === lobbyInfo.countPlayers) {
      socket.emit('lobbyFilled');
    }
    // пропуск в комнату
    else {
      socket.join(lobbyInfo.lobbyID);

      // проверка пора ли скрывать комнату
      if (alreadyConnected.length + 1 === lobbyInfo.countPlayers) {
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
  });

  //  отправка истории сообщений в лобби
  socket.on('getHistoryMessages', (lobbyID) => {
    messageModel.find({lobbyID: lobbyID})
      .then((messages) => {
        socket.emit('historyMessages', messages);
      })
      .catch((err) => {
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
      if (!err) {
        io.sockets.in(messageInfo.lobbyID).emit('newMessageInLobby', message);
      }
    });
  });

  // отключение челика
  socket.on('disconnect', () => {

    //  идет отсылка в лобби и превью
    socket.broadcast.emit('leaveSocket', socket.id);
  });

  socket.on('showRoom', _.debounce(async function (lobbyID) {
    socket.broadcast.emit('showingRoom', lobbyID);
  }, (Math.random() * (500 - 1) + 1)));


  socket.on('readyToPLay', (userInfo) => {
    LobbyModel.findOne({lobbyID: userInfo.lobbyID})
      .then((lobby) => {
        lobby.ready.push(userInfo.userID);
        lobby.save()
          .then(() => {
            socket.to(userInfo.lobbyID).emit('userReady', userInfo.userID);  //  для групы
            socket.emit('userReady', userInfo.userID);   // для меня
          })
          .catch();
      })
      .catch();


  });

  socket.on('unreadyToPLay', (userInfo) => {
    LobbyModel.findOne({lobbyID: userInfo.lobbyID})
      .then((lobby) => {
        lobby.ready.splice(lobby.ready.indexOf(userInfo.userID), 1);
        lobby.save()
          .then(() => {
            socket.to(userInfo.lobbyID).emit('userUnready', userInfo.userID); //  для групы
            socket.emit('userUnready', userInfo.userID); // для меня
          })
          .catch()
      })
      .catch()
  });

  socket.on('getInitialReady', (lobbyID) => {
    LobbyModel.findOne({lobbyID})
      .then((lobby) => {
        socket.emit('initialReady', lobby.ready);
      })
      .catch()
  });

  socket.on('tryToStart', (lobbyInfo) => {
    const alreadyConnected = io.nsps['/'].adapter.rooms[lobbyInfo.lobbyID] ?
      Object.keys(io.nsps['/'].adapter.rooms[lobbyInfo.lobbyID].sockets) : [];

    const allInPlace = alreadyConnected.length == lobbyInfo.countPlayers;
    // згначит все тут и все готовы
    if (lobbyInfo.allReady && allInPlace) {
      // начинается игра
      socket.emit('setStartGameTimer');
    }

  });



  socket.on('getQuestion', (gameInfo) => {
    console.log(1);
    const places = ['restaurants', 'parks', 'monuments', 'gardens', 'stadiums', 'constructions', 'museums'];
    const countries = ['Russia',
      'Australia',
      'Austria',
      'Azerbaijan',
      'Anguilla',
      'Argentina',
      'Armenia',
      'Arulco',
      'Belarus',
      'Belize',
      'Belgium',
      'Bermuda',
      'Bulgaria',
      'Brazil',
      'Great Britain',
      'Hungary',
      'Vietnam',
      'Haiti',
      'Guadeloupe',
      'Germany',
      'Holland',
      'Honduras',
      'Hong+Kong',
      'Greece',
      'Georgia',
      'Denmark',
      'Dominican+Republic',
      'Egypt',
      'Israel',
      'India',
      'Indonesia',
      'Jordan',
      'Iraq',
      'Iran',
      'Ireland',
      'Spain',
      'Italy',
      'Kazakhstan',
      'Cameroon',
      'Canada',
      'Caribbean',
      'Cyprus',
      'Kirghizstan',
      'China',
      'Korea',
      'Costa+Rica',
      'Cuba',
      'Kuwait',
      'Latvia',
      'Lebanon',
      'Lebanon',
      'Libya',
      'Lithuania',
      'Luxembourg',
      'Macedonia',
      'Malaysia',
      'Malta',
      'Mexico',
      'Mozambique',
      'Moldova',
      'Monaco',
      'Mongolia',
      'Morocco',
      'Netherlands',
      'New+Zealand',
      'Norway',
      'Isle+Of+Man',
      'Pakistan',
      'Peru',
      'Poland',
      'Portugal',
      'Reunion',
      'Romania',
      'USA',
      'El+Salvador',
      'Singapore',
      'Syria',
      'Slovakia',
      'Slovenia',
      'Suriname',
      'Tajikistan',
      'Taiwan',
      'Thailand',
      'Tunisia',
      'Turkmenistan',
      'Turkmenistan',
      'Turks+and+Caicos',
      'Turkey',
      'Uganda',
      'Uzbekistan',
      'Ukraine',
      'Finland',
      'France',
      'Croatia',
      'Czech',
      'Chile',
      'Switzerland',
      'Sweden',
      'Ecuador',
      'Estonia',
      'South+Africa',
      'Yugoslavia',
      'South+Korea',
      'Jamaica',
      'Japan'];
    const queryString = `${places[Math.floor(Math.random() * places.length)]}+in+${countries[Math.floor(Math.random() * countries.length)]}`;
    console.log(queryString);

    const options = {
      host: 'maps.googleapis.com',
      path: `/maps/api/place/textsearch/json?query=${queryString}&key=AIzaSyDOSq_kn0L-hgthgdNbywIpAaHcyZo51RM`
    };

    const req = https.get(options, function(res) {
      console.log('STATUS: ' + res.statusCode);
      //console.log('HEADERS: ' + JSON.stringify(res.headers));

      let bodyChunks = [];
      res.on('data', (chunk)  => {

        // поставить условие наличие каритинки
        bodyChunks.push(chunk);
      }).on('end', () => {
        let body = Buffer.concat(bodyChunks);
        const parsedBody = JSON.parse(body);
        const results = parsedBody.results;
        const randomResult = results[Math.floor(Math.random() * results.length)];
        console.log('randomResult ', randomResult);
        const photo = randomResult.photos[0];
        const photoReference = photo.photo_reference;

        https.get({
          host : 'maps.googleapis.com',
          path: `/maps/api/place/photo?maxwidth=540&photoreference=${photoReference}&key=AIzaSyDOSq_kn0L-hgthgdNbywIpAaHcyZo51RM`
        }, (res) => {

          let imageChunks = '';
          res.on('data', (chunk)  => {
            imageChunks += chunk;
          }).on('end', () => {
            let regexp = /"https.*"/;
            const photoURL = imageChunks.match(regexp)[0].split('"')[1];
            console.log(photoURL);
            socket.emit('question', photoURL);
          });
        });

        //console.log(photoReference);
      });
    });
  });


  /*
    questionModel.count()
      .then( (count) => {
        const randNum = Math.floor(Math.random() * count);
        questionModel.findOne({id : randNum})
          .then( (qstn) => {
            socket.emit('question', {
              ...qstn,
              from: 'question'
            });
          })
          .catch(() => {})
      });
*/


  socket.on('answer', (gameInfo) => {

   // сохранение, что этот челик отвечал
   questionModel.findOne({id: gameInfo.question.id})
     .then( (question) => {
       question.alreadyAnswered.push(gameInfo.userID);
       question.save()
         .then( () => {})
     })
     .catch( () => {});


   // оценка ответа

    // другим емит, количество баллов



    // отправка нового вопроса
    questionModel.count()
      .then( (count) => {
        const randNum = Math.floor(Math.random() * count);
        questionModel.findOne({id : randNum})
          .then( (qstn) => {
            socket.emit('question', {
              ...qstn,
              from: 'answer'
            });
          })
          .catch(() => {})
      });
  });










}
