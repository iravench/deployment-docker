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

app.listen(config.port);
log.info('start listening on port %s', config.port);
