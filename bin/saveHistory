#!/usr/bin/env node

const mongoose = require('mongoose');
const History = require('../models/History');
const User = require('../models/User');

// saveMedsToHistory
(async () => {
  try {
    const users = await User.find({});
    users.forEach(user => {
      const listOfDueMeds = user.medications.filter(med =>
        med.days.includes(
          new Date()
            .toLocaleDateString('en-US', { weekday: 'long' })
            .toLowerCase()
        )
      );
      if (listOfDueMeds.length) {
        const newHistory = new History({
          _id: new mongoose.Types.ObjectId(),
          dateDue: new Date().toLocaleDateString('en-US'),
          medsDue: listOfDueMeds,
          user: user._id,
        });
        User.findOne({ _id: user._id }, (err, user) => {
          if (err) return console.error(err);
          user.history = user.history.concat(newHistory);
          user.medications = user.medications.map(med => Object.assign(med, { administered: false }));
          user.save(err => {
            if (err) console.error(err);
            console.log(
              `${user.username}'s medication history was updated and their daily list reset`
            );
          })
        });
      }
    });
  } catch (err) {
    console.error(err);
  }
})();