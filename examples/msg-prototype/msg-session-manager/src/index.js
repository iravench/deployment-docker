'use strict';

import http from 'http'
import express from 'express'
import bodyParser from 'body-parser'
import socketio from 'socket.io'
import socketioJwt from './vendor/socketio-jwt'
import config from './config'
import logger from './utils/logger'
import controllers from './controllers'
import repo_impl from './implementations/repo_impl';
import repo_factory from './repo_factory';
import fm_selector_factory from './fm_selector_factory';
import { SessionAlreadyActivatedError } from './utils/errors'

const log = logger.child({widget_type: 'main'});

// init api
const app = express();
const apiRouter = express.Router();
controllers.init(apiRouter);
app.use('/v1', bodyParser.json(), bodyParser.urlencoded({ extended:false }), apiRouter);

// init socket.io
const server = http.Server(app);
const io = socketio(server);
const repo = repo_factory({ impl: repo_impl });
const fm_selector = fm_selector_factory({ repo: repo });
const authOpts = Object.assign({}, config.jwt, { additional_auth: (socket, decodedToken, onSuccess, onError) => {
  //TBD might want further compare socket client info with decoded token
  //to ensure this is in fact the client sending the token he properly obtained
  if (!socket.handshake.address.includes(decodedToken.conn.ip))
    onError({ message: 'client ip not match with token' }, 'invalid_token');

  // activate session base on the decoded token
  fm_selector.activate(decodedToken, socket.id).then((result) => {
    onSuccess();
  },
  (err) => {
    console.log(err);
    if (err instanceof SessionAlreadyActivatedError)
      onError({ message: 'session has already been activated' }, 'invalid_token');
    else
      onError({ message: 'unknown error, please retry' });
  });
}});
io.on('connection', socketioJwt.authorize(authOpts));
io.on('authenticated', (socket) => {
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
