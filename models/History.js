const Medication = require('./Medication').schema;
const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  _id: mongoose.ObjectId,
  dateDue: Date,
  medsDue: {
    type: [Medication],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }
});

const History = mongoose.model('History', historySchema);

module.exports = History;