'use strict';

import logger from '../utils/logger'
import { ValidationError } from '../utils/errors'
import repo_impl from '../../test/fixture/session_repo_impl';

const log = logger.child({widget_type: 'ticketController'});

export default {
  init: (router) => {
    router.post('/tickets', (req, res) => {
      log.info(req, 'new ticket requested');

      // user and conn should be extracted from request
      req.app.locals.fm_selector.allocate(repo_impl.valid_user, repo_impl.valid_conn).then(
        (ticket) => {
          log.info(res, 'new ticket created');
          res.json(ticket);
        },
        (err) => {
          let status = 500;
          if (err instanceof ValidationError) status = 400;
          res.status(status);
          // might want to extract this bit
          res.json({status: { code: status, message: err.message }});
        });
    });
  }
};
