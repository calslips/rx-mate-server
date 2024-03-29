require('dotenv').config();
const bcrypt = require('bcrypt');
const cors = require('cors');
const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('./models/User');
const Medication = require('./models/Medication');
const Subscription = require('./models/Subscription');
const saveHistory = require('./saveHistory');
const sendNotifications = require('./sendNotifications');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 8000;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DB_CONNECTION_STRING);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

app.use(cors());
app.use(express.json());
app.use(express.static('build'));
app.use(express.urlencoded({ extended: false }));

app.post('/registration', (req, res) => {
  const newUser = new User({
    username: req.body.username,
    password: bcrypt.hashSync(req.body.password, 10),
  });

  newUser.save(err => {
    if (err) {
      return res.status(400).json({
        title: 'error',
        error: 'Username already in use',
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

    const token = jwt.sign({ userId: user._id }, process.env.SECRET);
    return res.status(200).json({
      title: 'Login successful',
      token: token,
    });
  });
});

// if we wanted to implement token verification as middleware
// but for now we make use of the decoded token
// const verifyToken = (req, res, next) => {
//   jwt.verify(token, process.env.SECRET, (err, decoded) => {
//     if (err) return res.status(401).json({
//       title: 'unauthorized'
//     });
//   });
//   next();
// };

app.get('/user', (req, res) => {
  const token = req.headers.token;
  // verify token
  jwt.verify(token, process.env.SECRET, (err, decoded) => {
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
          medications: user.medications,
          history: user.history,
          swRegistered: user.swRegistered,
        }
      });
    });
  });
});

// implement route to add new med to user's meds list
app.post('/medication', (req, res) => {
  const token = req.headers.token;
  // verify token
  jwt.verify(token, process.env.SECRET, (err, decoded) => {
    if (err) res.status(401).json({
      title: 'unauthorized',
    });

    // token validated
    // create new med using data from req & token
    const newMeds = Array.from({length: req.body.timesPerDay}, (_, i) => new Medication({
      _id: new mongoose.Types.ObjectId(),
      name: req.body.name,
      count: req.body.count,
      type: req.body.type,
      dose: req.body.dose,
      timesPerDay: req.body.timesPerDay,
      days: req.body.days,
      time: req.body.times[i],
      administered: false,
      user: decoded.userId,
    }))

    User.findOne({ _id: decoded.userId }, (err, user) => {
      if (err) return console.error(err);
      // add new med to user's current list of meds
      user.medications = user.medications
        .concat(...newMeds)
        .sort((a, b) => +a.time.split(':').join('') - +b.time.split(':').join(''));
      // save modification to db
      user.save(err => {
        if (err) console.error(err);
        // med successfully saved
        return res.status(200).json({
          title: 'Medication successfully added',
          medications: newMeds,
        });
      });
    });
  });
});

// mark medication as taken PUT
app.put('/medication/:medId', (req, res) => {
  const token = req.headers.token;
  const medId = req.params.medId;
  // verify token
  jwt.verify(token, process.env.SECRET, (err, decoded) => {
    if (err) return res.status(401).json({
      title: 'unauthorized',
    });

    // token validated
    User.findOne({ _id: decoded.userId }, (err, user) => {
      if (err) return console.error(err);
      // correct user found
      user.medications = user.medications.map(m => {
        if (m._id.toString() === medId) m.administered = !m.administered;
        return m;
      });
      // successful medication update
      user.save(err => {
        if (err) return console.error(err);
        // updates successfully saved
        return res.status(200).json({
          title: 'Medication successfully updated',
          medications: user.medications,
        });
      });
    });
  });
});

// remove medication from list DELETE
app.delete('/medication/:medId', (req, res) => {
  const token = req.headers.token;
  const medId = req.params.medId;
  // verify token
  jwt.verify(token, process.env.SECRET, (err, decoded) => {
    if (err) return res.status(401).json({
      title: 'unauthorized',
    });

    // token validated
    User.findOne({ _id: decoded.userId }, (err, user) => {
      if (err) return console.error(err);
      // correct user found
      user.medications = user.medications.filter(m => m._id.toString() !== medId);
      // correct medication deleted
      user.save(err => {
        if (err) return console.error(err);
        // deletion successfully saved
        return res.status(204).json({
          title: 'Medication successfully deleted',
        });
      });
    });
  });
});

app.post('/subscribe', async (req, res) => {
  const token = req.headers.token;
  const subscription = new Subscription({ ...req.body });

  jwt.verify(token, process.env.SECRET, (err, decoded) => {
    if (err) res.status(401).json({
      title: 'unauthorized',
    });

    // token validated
    User.findOne({ _id: decoded.userId }, (err, user) => {
      if (err) return console.error(err);
      // add new service worker subscription data to user
      user.subscription = subscription;
      // save modification to db
      user.save(err => {
        if (err) console.error(err);
        // subscription successfully saved
        return res.status(200).json({
          title: 'Subscription successfully added',
          subscription,
        });
      });
    });
  });
});

app.delete('/subscribe', async (req, res) => {
  const token = req.headers.token;

  jwt.verify(token, process.env.SECRET, (err, decoded) => {
    if (err) res.status(401).json({
      title: 'unauthorized',
    });

    User.findOne({ _id: decoded.userId }, (err, user) => {
      if (err) return console.error(err);
      user.subscription = null;
      user.save(err => {
        if (err) return console.error(err);
        return res.status(204).json({
          title: 'Service worker subscription successfully removed',
        });
      });
    });
  });
});

app.post('/swRegistration', async (req, res) => {
  const token = req.headers.token;

  jwt.verify(token, process.env.SECRET, (err, decoded) => {
    if (err) res.status(401).json({
      title: 'unauthorized',
    });

    User.findOne({ _id: decoded.userId }, (err, user) => {
      if (err) return console.error(err);
      user.swRegistered = true;
      user.save(err => {
        if (err) return console.error(err);
        return res.status(200).json({
          title: 'Registration successfully added',
        });
      });
    });
  });
});

app.delete('/swRegistration', async (req, res) => {
  const token = req.headers.token;

  jwt.verify(token, process.env.SECRET, (err, decoded) => {
    if (err) res.status(401).json({
      title: 'unauthorized',
    });

    User.findOne({ _id: decoded.userId }, (err, user) => {
      if (err) return console.error(err);
      user.swRegistered = false;
      user.save(err => {
        if (err) return console.error(err);
        return res.status(204).json({
          title: 'Service worker subscription successfully removed',
        });
      });
    });
  });
});

app.get('/admin/sendNotifications', async (req, res) => {
  try {
    const notificationStatus = await sendNotifications();
    res.status(200).json({
      title: notificationStatus
    });
  } catch (err) {
    console.error(err);
  }
});

app.post('/admin/saveHistory', async (req, res) => {
  try {
    const historyStatus = await saveHistory();
    res.status(200).json({
      title: historyStatus
    });
  } catch (err) {
    console.error(err);
  }
});

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

connectDB().then(() => {
  app.listen(PORT, (err) => {
    if (err) return console.error(err);
    console.log(`Server running on port: ${PORT}`);
  })
})