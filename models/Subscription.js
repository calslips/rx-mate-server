const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  endpoint: String,
  expirationTime: Number,
  keys: {
    p256dh: String,
    auth: String,
  },
});

const Subsciption = mongoose.model('Subsciption', subscriptionSchema);

module.exports = Subscription;