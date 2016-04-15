'use strict';

const secret = process.env.JWT_SECRET || "1234567890";

export default {
  logger: {
    name: "msg-session-broker",
    level: "info"
  },
  jwt: {
    algorithm: 'HS256',      // signature and hash algorithm
    secret: secret,    // secret for signature signing and verification. can be replaced with certificate.
    expiresIn: 300,          // expiration of the token. 300 in seconds, or 2 days, 10h, 7d
    audience: "ibc",         // target the token is issued for
    subject: "fm auth",      // subject the token is issued for
    issuer: "bex msg",       // issuer of the token
    headers: { role: 'dir' } // custom information
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
  policy: {
  },
  port: 8080
};
