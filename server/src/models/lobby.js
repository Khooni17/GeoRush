const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LobbySchema = new Schema({
  lobbyID : {
    type: String
  },
  status: {
    type: String
  },
  countPlayers: {
    type: Number
  },
  players: {
    type: Array
  },
  ready: {
    type: Array
  }
},
  {
    versionKey: false,
    collection: 'LobbiesCollection'
  });

module.exports = mongoose.model('LobbiesModel', LobbySchema);