require('dotenv').config();
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('./models/User');
const app = express();

mongoose.connect(process.env.DB_CONNECTION_STRING);

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/registration', (req, res) => {
  const newUser = new User({
    username: req.body.username,
    password: bcrypt.hashSync(req.body.password, 10),
  });

  newUser.save(err => {
    if (err) {
      return res.status(400).json({
        title: 'error',
        error: 'Email already in use',
      });
    }
    return res.status(200).json({
      title: 'User successfully registered',
    });
  });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, (err) => {
  if (err) return console.error(err);
  console.log(`Server running on port: ${PORT}`);
});