'use strict';

import messageController from './messageController'

export default {
  init: (router) => {
    messageController.init(router);

    router.get("/health", (req, res) => {
      res.json({ status: "ok" });
    });

    return;
  }
};
