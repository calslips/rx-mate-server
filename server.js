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

app.post('/login', (req, res) => {
  User.findOne({ username: req.body.username }, (err, user) => {
    if (err) {
      return res.status(500).json({
        title: 'server error',
        error: err,
      });
    }
    if (!user)  {
      return res.status(400).json({
        title: 'user not found',
        error: 'Invalid username',
      });
    }
    if (!bcrypt.compareSync(req.body.password, user.password)) {
      return res.status(401).json({
        title: 'unable to login',
        error: 'Invalid password',
      });
    }

    const token = jwt.sign({ userId: user._id }, 'secretOrPrivateKey');
    return res.status(200).json({
      title: 'Login successful',
      token: token,
    });
  });
});

app.get('/user', (req, res) => {
  const token = req.headers.token;
  // verify token
  jwt.verify(token, 'secretOrPrivateKey', (err, decoded) => {
    if (err) return res.status(401).json({
      title: 'unauthorized',
    });
    // token validated
    User.findOne({ _id: decoded.userId }, (err, user) => {
      if (err) return console.error(err);
      return res.status(200).json({
        title: 'success',
        user: {
          username: user.username,
        }
      });
    });
  });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, (err) => {
  if (err) return console.error(err);
  console.log(`Server running on port: ${PORT}`);
});