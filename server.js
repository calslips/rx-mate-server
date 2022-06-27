require('dotenv').config();
const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const app = express();

mongoose.connect(process.env.DB_CONNECTION_STRING);

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

const PORT = process.env.PORT || 8000;

app.listen(PORT, (err) => {
  if (err) return console.error(err);
  console.log(`Server running on port: ${PORT}`);
});