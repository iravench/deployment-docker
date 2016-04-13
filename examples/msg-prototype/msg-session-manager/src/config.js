'use strict';

export default {
  logger: {
    name: "msg-session-manager",
    level: "info"
  },
  jwt: {
    algorithm: 'HS256',      // signature and hash algorithm
    secret: "1234567890",    // secret for signature signing and verification. can be replaced with certificate.
    audience: "ibc",         // target the token is issued for
    subject: "fm auth",      // subject the token is issued for
    issuer: "bex msg",       // issuer of the token
    headers: { role: 'dir' },// custom information
    timeout: 3000            // timespan in seconds btw socket connect and authenticate, timeout cause disconnect
  },
  storage: {
    redis: {
      ip: "192.168.99.100",
      port: 6379,
      family: 4,
      password: "pink5678",
      db: 0
    },
    mysql: {
      host: "192.168.99.100",
      port: 3306,
      database: "bex-msg",
      user: "pink",
      password: "5678"
    }
  },
  port: 9090
};
