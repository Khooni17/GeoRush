const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
    lobbyID: {
      type: String
    },
    username: {
      type: String
    },
    text: {
      type: String
    },
    date: {
      type: Date
    },
  }, {
  versionKey: false,
  collection: 'messageCollection'
});

module.exports = mongoose.model('messageModel', messageSchema);