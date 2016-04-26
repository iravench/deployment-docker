'use strict';

import config from './config'
import logger from './utils/logger'
import express from 'express'
import controllers from './controllers'
import bodyParser from 'body-parser'

import repo_impl from './implementations/repo_impl';
import repo_factory from './repo_factory';
import fm_token_factory from './fm_token_factory';
import fm_token_impl from './implementations/fm_token_impl';
import fm_policy_factory from './fm_policy_factory';
import fm_selector_factory from './fm_selector_factory';

const repo = repo_factory({ impl: repo_impl });
const fm_policy = fm_policy_factory({ repo: repo });
const fm_token = fm_token_factory({ impl: fm_token_impl });
const fm_selector = fm_selector_factory({ repo: repo, policy: fm_policy, token: fm_token });
const log = logger.child({module: 'index'});

const app = express();
app.locals.fm_selector = fm_selector;
const apiRouter = express.Router();
controllers.init(apiRouter);
app.use('/v1', bodyParser.json(), bodyParser.urlencoded({ extended:true }), apiRouter);

//TBD index page for socket client, these should be hosted on some other application
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/index.html');
});
app.get('/jquery-2.2.3.min.js', function (req, res) {
  res.sendFile(__dirname + '/public/jquery-2.2.3.min.js');
});
app.get('/socket.io-1.4.5.js', function (req, res) {
  res.sendFile(__dirname + '/public/socket.io-1.4.5.js');
});

app.listen(config.port);
log.info('start listening on port %s', config.port);
