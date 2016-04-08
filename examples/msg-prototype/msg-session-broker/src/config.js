'use strict';

export default {
  logger: {
    name: "msg-session-broker",
    level: "info"
  },
  jwt: {
    algorithm: 'HS256',      // signature and hash algorithm
    secret: "1234567890",    // secret for signature signing and verification. can be replaced with certificate.
    expiresIn: 300,          // expiration of the token. 300 in seconds, or 2 days, 10h, 7d
    audience: "ibc",         // target the token is issued for
    subject: "fm auth",      // subject the token is issued for
    issuer: "bex msg",       // issuer of the token
    headers: { role: 'dir' } // custom information
  },
  policy: {
  },
  port: 8080
};
