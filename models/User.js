const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    unique: true,
    type: String,
  },
  password: String,
});

const User = mongoose.model('User', userSchema);

module.exports = User;