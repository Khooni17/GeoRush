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

    //  идет отсылка в лобби и превью  и гейм
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

  socket.on('getWhoAdmin', (lobbyID) => {
    socket.to(lobbyID).emit('getAdminID');
  });

  socket.on('adminFounded', (lobbyInfo) => {
    socket.to(lobbyInfo.lobbyID).emit('admin', lobbyInfo.adminID);
  });

  socket.on('getInitialReady', (lobbyID) => {
    LobbyModel.findOne({lobbyID})
      .then((lobby) => {
        try {
          socket.emit('initialReady', lobby.ready );
        } catch (err) {
          socket.emit('initialReady', []);
        }
      })
      .catch( (err) => {
        console.log(err);
      })
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
    const places = ['parks', 'monuments', 'gardens', 'buidings'];
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
      'Great+Britain',
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

    const getImage = () => {
      const queryString = `${places[Math.floor(Math.random() * places.length)]}+in+${countries[Math.floor(Math.random() * countries.length)]}`;
      const options = {
        host: 'maps.googleapis.com',
        path: `/maps/api/place/textsearch/json?query=${queryString}&key=AIzaSyDOSq_kn0L-hgthgdNbywIpAaHcyZo51RM`
      };
      const req = https.get(options, function(res) {
        let bodyChunks = [];
        res.on('data', (chunk)  => {

          bodyChunks.push(chunk);
        }).on('end', () => {
          let body = Buffer.concat(bodyChunks);
          const parsedBody = JSON.parse(body);
          const results = parsedBody.results;
          try {
            const randomResult = results[Math.floor(Math.random() * results.length)];
            const photos = randomResult.photos;
            const location = randomResult.geometry.location;
            const photo = photos[0];
            const photoReference = photo.photo_reference;

            https.get({
              host: 'maps.googleapis.com',
              path: `/maps/api/place/photo?maxwidth=540&photoreference=${photoReference}&key=AIzaSyDOSq_kn0L-hgthgdNbywIpAaHcyZo51RM`
            }, (res) => {

              var imageChunks = '';
              res.on('data', (chunk) => {
                imageChunks += chunk;
              }).on('end', () => {

                let regexp = /"https.*"/;
                const photoURL = imageChunks.match(regexp)[0].split('"')[1];

                socket.emit('question', {
                  photoURL,
                  answer: location
                });
              });
            });
          } catch (err) {
            getImage();
          }
        });
      });
    };

    getImage();
  });

  socket.on('sendQuestionToOthers', (gameInfo) => {
    socket.to(gameInfo.lobbyID).emit('question', gameInfo.question);
  });

  socket.on('answer', (gameInfo) => {

    // оценка ответа
    function distance(lat1, lon1, lat2, lon2) {
      let p = 0.017453292519943295;    // Math.PI / 180
      let c = Math.cos;
      let a = 0.5 - c((lat2 - lat1) * p)/2 +
        c(lat1 * p) * c(lat2 * p) *
        (1 - c((lon2 - lon1) * p))/2;

      return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
    }

    const x = distance(gameInfo.question.answer.lat,
                       gameInfo.question.answer.lng,
                       gameInfo.answer.lat,
                       gameInfo.answer.lng);

    let result;
    if (x > 10000) {
      result = 0;
    } else {
      result = Math.ceil(Math.pow((x - 12000), 2) * 5 * Math.pow(10, -6));
    }

    // другим емит, количество баллов
    socket.to(gameInfo.lobbyID).emit('userAnswered', {
      userID: gameInfo.userID,
      result: result
    });

    socket.emit('userAnswered', {
      userID: gameInfo.userID,
      result: result
    });
  });










};
