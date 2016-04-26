'use strict';

import logger from '../utils/logger'
import { ValidationError } from '../utils/errors'

const log = logger.child({module: 'messageController'});

export default {
  init: (router) => {
    router.post('/messages', (req, res) => {
      log.debug('batch message delivery requested');

      req.app.locals.messaging.batch(
        [{socket: 'id', messages: []}]
      ).then(
        (result) => {
          log.debug('message delivered with/without errors');
          res.json([{unsent: 'id', reason: 'xx'}]);
        },
        (err) => {
          //TBD might want to extract this into a middleware
          log.warn(err);
          let status = 500;
          if (err instanceof ValidationError) status = 400;
          res.status(status);
          res.json({status: { code: status, message: err.message }});
        });
    });
  }
};
