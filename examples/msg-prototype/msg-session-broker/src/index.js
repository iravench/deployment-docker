'use strict';

import config from './config'
import log from './utils/logger'
import express from 'express'
import controllers from './controllers'
import bodyParser from 'body-parser'
import repo from '../test/fixture/session_repo';
import FM_Selector from './FM_Selector';

const app = express();
app.locals.fm_selector = new FM_Selector(repo);
const apiRouter = express.Router();
controllers.init(apiRouter);
app.use('/v1', bodyParser.json(), bodyParser.urlencoded({ extended:false }), apiRouter);

app.listen(config.port);
log.info('start listening on port %s', config.port);
