'use strict';

import http from 'http'
import express from 'express'
import bodyParser from 'body-parser'
import socketio from 'socket.io'
import socketioJwt from './vendor/socketio-jwt'
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
const authOpts = Object.assign({}, config.jwt, { additional_auth: (socket, decodedToken, onSuccess, onError) => {
  //TBD might want further compare socket client info with decoded token
  //to ensure this is in fact the client sending the token he properly obtained
  if (!socket.handshake.address.includes(decodedToken.conn.ip))
    onError({ message: 'client ip not match with token' }, 'invalid_token');

  // activate session base on decoded token
  // fail to activate session will cause connection to be unauthorized, such as session already been activated.
  onSuccess();
}});
io.on('connection', socketioJwt.authorize(authOpts));
io.on('authenticated', (socket) => {
  // just show the token for fun
  console.log('decoded token from client', socket.decoded_token);
  // activate session
  console.log('about to activate session', socket.decoded_token.session_id);
  // TBD what if activation failed? might end up writing a custom socketio-jwt lib

  // what you want to do with a secured socket
  socket.emit('hello', { data: "how are you?" });
  socket.on('howdy', function (data) {
    console.log(data);
  });
});

// when on connection, should perform a token based authentication
// a token is compute base, shall not be stored on server.
// a token also has expiry setting, and other client information embeded
// so that after verifying the sigature, server can make use of these embeded information
//
// after a web socket connection is established and authenticated,
// socket_id, fm_ip will then be used to activate the session
//
// activated session's socket_id can be used to push server side messages
// activated session's fm_id can be used to identify server load and determine further session allocation. (for broker policy)

server.listen(config.port);
log.info('start listening on port %s', config.port);
