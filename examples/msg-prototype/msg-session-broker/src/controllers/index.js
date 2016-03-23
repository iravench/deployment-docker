'use strict';

import ticketController from './ticketController'

export default {
  init: (app) => {
    ticketController.init(app);

    app.get("/health", (req, res) => {
      res.json({ status: "ok" });
    });

    return;
  }
};
