'use strict';

import http from 'http'
import express from 'express'
import bodyParser from 'body-parser'
import socketio from 'socket.io'
import socketioJwt from 'socketio-jwt'
import config from './config'
import logger from './utils/logger'
import controllers from './controllers'

const log = logger.child({widget_type: 'main'});

// init api
const app = express();
const apiRouter = express.Router();
controllers.init(apiRouter);
app.use('/v1', bodyParser.json(), bodyParser.urlencoded({ extended:false }), apiRouter);

// init socket.io
const server = http.Server(app);
const io = socketio(server);

io.on('connection', socketioJwt.authorize(config.jwt));

io.on('authenticated', (socket) => {
    socket.emit('news', { hello: 'world' });
    socket.on('my other event', function (data) {
      console.log(data);
    });
  });

// onconnection should perform token based authentication via socket.request.params
// a token is compute base, should not be stored on server.
// a token also has timeout settings, and fm id/ip embeded
//
// after a ws conn is initiated,
// socket id, fm id will be updated to session record
//
// activated session's socket id will be used to push server messages
// activated session's fm id will be used to identify server load and determine fm-socket mappings.

// init index page
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

server.listen(config.port);
log.info('start listening on port %s', config.port);
