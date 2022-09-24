#!/usr/bin/env node

require('dotenv').config();
const webPush = require('web-push');
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.DB_CONNECTION_STRING);

// sendNotificationsToClient
(async () => {
  const options = {
    vapidDetails: {
      subject: `mailto:${process.env.MY_EMAIL}`,
      publicKey: process.env.PUBLIC_VAPID_KEY,
      privateKey: process.env.PRIVATE_VAPID_KEY,
    }
  };
  try {
    const users = await User.find({});
    users.forEach(user => {
      const medsDueTodayWithinTheHour = user.medications.filter(med => {
        const timeDifference = (new Date() - new Date(`${new Date().toLocaleDateString()} ${med.time}`)) / 3600000;
        return med.days.includes(
          new Date()
            .toLocaleDateString('en-US', { weekday: 'long' , timeZone: 'America/New_York'})
            .toLowerCase()
        ) && (timeDifference < .02 && timeDifference > -.99);
      });
      if (medsDueTodayWithinTheHour.length && user.subscription) {
        medsDueTodayWithinTheHour.forEach(medDue => {
          webPush.sendNotification(
            user.subscription,
            JSON.stringify({
              title: 'Medication Notification!',
              description: `${medDue.name} due at ${medDue.time}.`,
              image: 'https://i.ibb.co/PYnK8SL/comment-medical-solid.webp',
            }),
            options
          );
        });
      }
    });
  } catch (err) {
    console.error(err);
  }
})();