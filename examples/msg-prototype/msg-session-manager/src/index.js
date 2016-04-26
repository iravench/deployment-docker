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
import fm_session_factory from './fm_session_factory';
import fm_register_factory from './fm_register_factory';
import auth_factory from './auth_factory'

const repo = repo_factory({ impl: repo_impl });
const fm_session = fm_session_factory({ repo: repo });
const io_auth = auth_factory({ fm_session: fm_session });
const fm_register = fm_register_factory({ repo: repo });
const log = logger.child({module: 'index'});

// init api
const app = express();
const apiRouter = express.Router();
controllers.init(apiRouter);
app.use('/v1', bodyParser.json(), bodyParser.urlencoded({ extended:false }), apiRouter);

// init socket.io
const server = http.Server(app);
const io = socketio(server);
const authOpts = Object.assign({}, config.jwt, { additional_auth: io_auth.auth });
//TBD should the token be a one-time-use only?
//how should client socket reconnection behave?
io.on('connection', socketioJwt.authorize(authOpts));
io.on('authenticated', (socket) => {
  log.info('socket authenticated');

  socket.on('disconnect', () => {
    log.info('socket disconnect');
    io_auth.close(socket.id);
  });

  // stuff you want to do with a secured socket
  socket.emit('hello', { data: "how are you?" });
  socket.on('howdy', function (data) {
    log.info(data);
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
//TBD mysql is too heavy for registering a session imo, and too many places could break
//TBD activated session's socket_id can be used to push server side messages, or maybe fm_manager_id? specific socket_id should probably be held in that manager's memory
//TBD activated session's fm_id can be used to identify server load and determine further session allocation. (for broker policy) to gain better performance, we might want to do this on redis, just maintain a record on whenever a socket gets authenticated and disconnected.
//TBD what if an fm crashes and subsequently loses all socket connections?
// some kind of monitor system should be watching this event.
// when it happens, trigger a redis/mysql session close-up?
//TBD what happens when client tries to establish socket connection with a failed fm?
//should broker accept the fail token in order to assign a new fm?

server.listen(config.port);
log.info('start listening on port %s', config.port);

//register to available fm pool
fm_register.register(config.fm.id, config.fm.ip, config.fm.port).then(
  () => {
    log.info('front machine registered');
  },
  (err) => {
    // if not registered, there should not be any socket connections coming in, so just error out
    log.fatal(err, 'error registering front machine');
    process.exit(1);
  });

//trap interrupt signals and perform cleanup
['SIGINT','SIGUSR2'].forEach((signal) => {
  process.on(signal, () => {
    cleanup();
  });
});

function cleanup() {
  Promise.all([
    fm_register.deregister(config.fm.id),
    fm_session.close_all(config.fm.id)
  ]).then(
    () => {
      log.info('clean up finished, exit process');
      process.exit();
    },
    (err) => {
      //TBD when errors, might want triger some offline cleanup job
      log.error('error cleaning up');
      process.exit(1);
    });
}
