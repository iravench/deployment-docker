'use strict';

import someController from './someController'

export default {
  init: (app) => {
    someController.init(app);

    app.get("/health", (req, res) => {
      res.json({ status: "hell yeah" });
    });

    return;
  }
};
