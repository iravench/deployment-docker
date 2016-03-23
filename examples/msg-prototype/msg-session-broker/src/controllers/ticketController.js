'use strict';

import log from '../utils/logger'

export default {
  init: (app) => {
    app.post('/tickets', (req, res) => {
      log.info(req, 'new ticket requested');

      const ticket = {
        token: "some token",
        fm_ip: '192.168.1.111'
      };
      res.json(ticket);

      log.info({res: res, ticket: ticket}, 'new ticket created');
    });
  }
};
