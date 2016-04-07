'use strict';

export default {
  logger: {
    name: "msg-session-manager",
    level: "info"
  },
  jwt: {
    secret: "1234567890",
    audience: "ibc",
    subject: "fm auth",
    issuer: "bex messaging",
    timeout: 15000
  },
  port: 9090
};
