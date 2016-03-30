'use strict';

import config from './config'
import log from './utils/logger'
import express from 'express'
import controllers from './controllers'
import bodyParser from 'body-parser'

const app = express();
const apiRouter = express.Router();
controllers.init(apiRouter);
app.use('/v1', bodyParser.json(), bodyParser.urlencoded({ extended:false }), apiRouter);

// init socket.io
//
// onconnection should perform token based authentication via socket.request.params
// a token is compute base, should not be stored on server.
// a token also has timeout settings, and fm id/ip embeded
//
// after a ws conn is initiated,
// socket id, fm id will be updated to session record
//
// activated session's socket id will be used to push server messages
// activated session's fm id will be used to identify server load and determine fm-socket mappings.

app.listen(config.port);
log.info('start listening on port %s', config.port);
