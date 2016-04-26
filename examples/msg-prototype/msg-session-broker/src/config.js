'use strict';

function isDebug() {
  const debug = process.env.DEBUG;
  if (debug) {
    if (debug == 'false' || debug == '0') return false;
    return true;
  }
  return false;
}

const env = process.env.NODE_ENV || "development";
const debug = isDebug();
const secret = process.env.JWT_SECRET || "1234567890";
const redis_ip = process.env.REDIS_IP || "192.168.99.100";
const mysql_ip = process.env.MYSQL_IP || "192.168.99.100";

export default {
  env: env,
  debug: debug,
  applicationName: "msg-session-broker",
  jwt: {
    algorithm: 'HS256',      // signature and hash algorithm
    secret: secret,          // secret for signature signing and verification. can be replaced with certificate.
    expiresIn: 300,          // expiration of the token. 300 in seconds, or 2 days, 10h, 7d
    audience: "ibc",         // target the token is issued for
    subject: "fm auth",      // subject the token is issued for
    issuer: "bex msg",       // issuer of the token
    headers: { role: 'dir' } // custom information
  },
  storage: {
    redis: {
      ip: redis_ip,
      port: 6379,
      family: 4,
      password: "pink5678",
      db: 0
    },
    mysql: {
      host: mysql_ip,
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
