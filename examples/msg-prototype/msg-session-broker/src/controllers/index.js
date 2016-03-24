'use strict';

import ticketController from './ticketController'

export default {
  init: (router) => {
    ticketController.init(router);

    router.get("/health", (req, res) => {
      res.json({ status: "ok" });
    });

    return;
  }
};
