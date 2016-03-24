'use strict';

import logger from '../utils/logger'
import { ValidationError } from '../utils/errors'

const log = logger.child({widget_type: 'ticketController'});

export default {
  init: (app) => {
    app.post('/tickets', (req, res) => {
      log.info(req, 'new ticket requested');

      // these information should be extracted from request
      const user = { user_id: 'user_id', device_id: 'device_id' };
      const conn = { ip: '192.168.1.111' };

      req.app.locals.fm_selector.allocate(user, conn, (err, ticket) => {
        if (err) {
          let status = 500;
          if (err instanceof ValidationError) status = 400;
          res.status(status);
          // might want to extract this bit
          res.json({status: { code: status, message: err.message }});
        } else {
          log.info(res, 'new ticket created');
          res.json(ticket);
        }
      });
    });
  }
};
