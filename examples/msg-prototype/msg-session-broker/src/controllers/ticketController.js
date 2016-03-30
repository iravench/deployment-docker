'use strict';

import logger from '../utils/logger'
import { ValidationError } from '../utils/errors'
import repo_impl from '../../test/fixture/repo_impl';

const log = logger.child({widget_type: 'ticketController'});

export default {
  init: (router) => {
    router.post('/tickets', (req, res) => {
      log.info('new ticket requested');

      // TBD user and conn should be extracted from request
      // TBD validation should be extracted from fm_selector since it's the controller's job

      req.app.locals.fm_selector.allocate(repo_impl.valid_user, repo_impl.valid_conn).then(
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
