'use strict';

export default {
  logger: {
    name: "msg-session-broker",
    level: "info"
  },
  jwt: {
    secret: "1234567890",
    expiresIn: 300,    //300 in seconds, or 2 days, 10h, 7d
    audience: "ibc",
    subject: "fm auth",
    issuer: "bex messaging"
  },
  port: 8080
};
