const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');

const routes = require('./routes');
const { setupWebSocket } = require('./websocket');

const app = express();
const server = http.Server(app);
const { DB_USER, DB_PASS, DB_NAME } = require('../.env');

setupWebSocket(server);

mongoose.connect(`mongodb+srv://${DB_USER}:${DB_PASS}@cluster0-io4g2.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

app.use(cors())
app.use(express.json());
app.use(routes);

server.listen(3333);