'use strict';

import logger from '../utils/logger'
import { ValidationError } from '../utils/errors'

const log = logger.child({widget_type: 'ticketController'});

export default {
  init: (router) => {
    router.post('/tickets', (req, res) => {
      log.info('new ticket requested');

      // TBD user and conn should be extracted from request and validated
      const valid_user = req.body.user;
      const valid_conn = req.body.conn;

      // TBD validation should be extracted out of fm_selector since it's the controller's job
      req.app.locals.fm_selector.allocate(valid_user, valid_conn).then(
        (ticket) => {
          log.info('new ticket created');
          res.json(ticket);
        },
        (err) => {
          //TBD might want to extract this into a middleware
          let status = 500;
          if (err instanceof ValidationError) status = 400;
          res.status(status);
          res.json({status: { code: status, message: err.message }});
        });
    });
  }
};
