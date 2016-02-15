'use strict';

export default {
  init: (app) => {
    app.get("/some/cooldude", (req, res) => {
      res.json({ name: "Mr.Node", interests: "docker, other cool stuff", from_node_planet: process.pid });
    });
  }
};
