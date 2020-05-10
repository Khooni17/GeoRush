const messageModel = require('../models/message');
const LobbyModel = require('../models/lobby');
const questionModel = require('../models/question_model');
const https = require('https');
const _ = require('lodash');
const MongoClient = require('mongodb').MongoClient;

module.exports = (io, socket) => {
    socket.on('saveNick', (nick) => {
        var db;
        MongoClient.connect('mongodb://localhost:27017/geoRush', function(err,database) {
            if(err){
                return console.log(err)
            }
            db = database;
            db.collection('nicknames').insert(nick, (err, result)=> {
                if(err){
                    return console.log(err);
                }
                console.log(nick);
                db.collection('nicknames').find().toArray(function(err,docs) {
                    if(err){
                        return console.log(err);
                    }
                    docs = docs.sort((a, b) => a.score < b.score ? 1 : -1).slice(0,9);
                    socket.emit('saved', docs);
                })
            })
        });

    });

    socket.on('getTopPlayers', () => {
        var db;
        MongoClient.connect('mongodb://localhost:27017/geoRush', function(err,database) {
            if(err){
                return console.log(err)
            }
            db = database;
            db.collection('nicknames').find().toArray(function(err,docs) {
                if(err){
                    return console.log(err);
                }
                docs = docs.sort((a, b) => a.score < b.score ? 1 : -1).slice(0,9);
                socket.emit('topPlayersList', docs);
            })
        });

    })

    socket.on('getQuestion', (gameInfo) => {
        const places = ['parks', 'buidings','places',];
        const countriesRus = [
            "Россия",
            "Австралия",
            "Австрия",
            "Азербайджан",
            "Ангилья",
            "Аргентина",
            "Армения",
            "Арулько",
            "Беларусь",
            "Белиз",
            "Бельгия",
            'Бермуды',
            "Болгария",
            "Бразилия",
            "Венгрия",
            "Вьетнам",
            "Гаити",
            "Гваделупа",
            "Германия",
            "Голландия",
            "Гондурас",
            "Гонконг Гонконг",
            "Греция",
            "Грузия",
            "Дания",
            'Доминиканской Республики',
            "Египет",
            "Израиль",
            "Индия",
            "Индонезия",
            "Иордания",
            "Ирак",
            "Иран",
            "Ирландия",
            "Испания",
            "Италия",
            "Казахстан",
            "Камерун",
            "Канада",
            "Карибский",
            "Кипр",
            "Кыргызстан",
            "Китай",
            "Корея",
            "Коста Рика",
            "Куба",
            "Кувейт",
            "Латвия",
            "Ливан",
            "Ливан",
            "Ливия",
            "Литва",
            "Люксембург",
            "Македония",
            "Малайзия",
            "Мальта",
            "Мексика",
            "Мозамбик",
            "Молдова",
            "Монако",
            "Монголия",
            "Марокко",
            "Нидерланды",
            "новая Зеландия",
            "Норвегия",
            "Пакистан",
            "Перу",
            "Польша",
            "Португалия",
            "Воссоединение",
            "Румыния",
            "США",
            "Сингапур",
            "Сирия",
            "Словакия",
            "Словения",
            "Суринам",
            "Таджикистан",
            "Тайвань",
            "Таиланд",
            "Тунис",
            "Туркменистан",
            "Туркменистан",
            "Турция",
            "Уганда",
            "Узбекистан",
            "Украина",
            "Финляндия",
            "Франция",
            "Хорватия",
            "Чешский",
            "Чили",
            "Швейцария",
            "Швеция",
            "Эквадор",
            "Эстония",
            "Южная Африка",
            "Югославия",
            "Южная Корея",
            "Ямайка",
            "Япония"
        ];
        const countries = [
            "Russia",
            "Australia",
            "Austria",
            "Azerbaijan",
            "Anguilla",
            "Argentina",
            "Armenia",
            "Arulco",
            "Belarus",
            "Belize",
            "Belgium",
            'Bermuda',
            "Bulgaria",
            "Brazil",
            "Hungary",
            "Vietnam",
            "Haiti",
            "Guadeloupe",
            "Germany",
            "Holland",
            "Honduras",
            "Hong Kong+Hong Kong",
            "Greece",
            "Georgia",
            "Denmark",
            'Dominican+Republic',
            "Egypt",
            "Israel",
            "India",
            "Indonesia",
            "Jordan",
            "Iraq",
            "Iran",
            "Ireland",
            "Spain",
            "Italy",
            "Kazakhstan",
            "Cameroon",
            "Canada",
            "Caribbean",
            "Cyprus",
            "Kyrgyzstan",
            "China",
            "Korea",
            "Costa+Rika",
            "Cuba",
            "Kuwait",
            "Latvia",
            "Lebanon",
            "Lebanon",
            "Livia",
            "Lithuania",
            "Luxembourg",
            "Macedonia",
            "Malaysia",
            "Malta",
            "Mexico",
            "Mozambique",
            "Moldova",
            "Monaco",
            "Mongolia",
            "Morocco",
            "Netherlands",
            "New+Zealand",
            "Norway",
            "Pakistan",
            "Peru",
            "Poland",
            "Portugal",
            "Reunion",
            "Romania",
            "USA",
            "Singapore",
            "Syria",
            "Slovakia",
            "Slovenia",
            "Suriname",
            "Tajikistan",
            "Taiwan",
            "Thailand",
            "Tunis",
            "Turkmenistan",
            "Turkmenistan",
            "Turkey",
            "Uganda",
            "Uzbekistan",
            "Ukraine",
            "Finland",
            "France",
            "Croatia",
            "Czech",
            "Chile",
            "Switzerland",
            "Sweden",
            "Ecuador",
            "Estonia",
            "South+Africa",
            "Yugoslavia",
            "South+Korea",
            "Jamaica",
            "Japan"
        ];

        const getImage = () => {
            const randPlace = places[Math.floor(Math.random() * places.length)];
            const randCountryNum = Math.floor(Math.random() * countries.length);
            const queryString = `${randPlace}+in+${countries[randCountryNum]}`;
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

                            let imageChunks = '';
                            res.on('data', (chunk) => {
                                imageChunks += chunk;
                            }).on('end', () => {

                                let regexp = /"https.*"/;
                                const photoURL = imageChunks.match(regexp)[0].split('"')[1];

                                let randCountries = [];
                                randCountries.push(countriesRus[Math.floor(Math.random() * countries.length)]);
                                randCountries.push(countriesRus[Math.floor(Math.random() * countries.length)]);
                                randCountries.push(countriesRus[Math.floor(Math.random() * countries.length)]);
                                randCountries.push(countriesRus[randCountryNum]);

                                randCountries = randCountries.sort(function(){
                                    return Math.random() - 0.5;
                                })

                                socket.emit('onQuestion', {
                                    photoURL,
                                    answer: {
                                        location,
                                        correctCountry: countriesRus[randCountryNum]
                                    },
                                    variants: randCountries
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

    function distance(lat1, lon1, lat2, lon2) {
        let p = 0.017453292519943295;    // Math.PI / 180
        let c = Math.cos;
        let a = 0.5 - c((lat2 - lat1) * p)/2 +
            c(lat1 * p) * c(lat2 * p) *
            (1 - c((lon2 - lon1) * p))/2;
        return 12742 * Math.asin(Math.sqrt(a));
    }

    socket.on('answer', (gameInfo) => {
        console.log(gameInfo);
        let result;
        if(gameInfo.typeAnswer){
            const x = distance(
                gameInfo.question.answer.location.lat,
                gameInfo.question.answer.location.lng,
                gameInfo.answerUser.lat,
                gameInfo.answerUser.lng);
            if (x > 10000) {
                result = 0;
            } else {
                result = Math.ceil(Math.pow((x - 12000), 2) * 5 * Math.pow(10, -6));
            }
        } else {
            result = gameInfo.answerUser === gameInfo.question.answer.correctCountry ? 100 : 0;
        }

        socket.emit('resultAnswer', {
            result
        });
    });



    socket.on('gameFinished', (gameInfo) => {
        LobbyModel.findOne({lobbyID: gameInfo.lobbyID})
            .then( (lobby) => {
                try{
                    lobby.status = 'finished';
                    lobby.save()
                        .then()
                        .catch()
                } catch (e) {

                }
            })
            .catch()


    });









};
