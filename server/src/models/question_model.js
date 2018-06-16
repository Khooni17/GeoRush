const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const questionSchema = new Schema({
  id: {
    type: Number
  },
  question: {
    type: String
  },
  answer: {
    type: String
  },
  alreadyAnswered: {
    type: Array
  }
}, {
  versionKey: false,
  collection: 'questionsCollection'
});


module.exports = mongoose.model('questionModel', questionSchema);