const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const port = 7777;

//const mongoose = require('mongoose');
//mongoose.connect('mongodb://localhost:27017/GEO', {});
//mongoose.Promise = require('bluebird');

server.listen(port, () => {
    console.log(`server run on port ${port}`);
});





// сокеты
require('./sockets')(io);





