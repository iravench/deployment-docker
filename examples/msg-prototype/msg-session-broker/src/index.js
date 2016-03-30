'use strict';

import config from './config'
import log from './utils/logger'
import express from 'express'
import controllers from './controllers'
import bodyParser from 'body-parser'

import repo_impl from '../test/fixture/repo_impl';
import fm_token from './fm_token';
import fm_policy from './fm_policy';
import repo_factory from './repo_factory';
import fm_selector_factory from './fm_selector_factory';

const repo = repo_factory({ impl: repo_impl });
const fm_selector = fm_selector_factory({ repo: repo, policy: fm_policy, token: fm_token });

const app = express();
app.locals.fm_selector = fm_selector;
const apiRouter = express.Router();
controllers.init(apiRouter);
app.use('/v1', bodyParser.json(), bodyParser.urlencoded({ extended:false }), apiRouter);

app.listen(config.port);
log.info('start listening on port %s', config.port);
