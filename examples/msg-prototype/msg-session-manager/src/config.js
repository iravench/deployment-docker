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
const fm_id = process.env.FM_ID || "fm-1";
const fm_ip = process.env.FM_IP || "127.0.0.1";
const fm_port = process.env.FM_PORT || 9090;
const redis_ip = process.env.REDIS_IP || "192.168.99.100";
const mysql_ip = process.env.MYSQL_IP || "192.168.99.100";

//TBD should be further customized based on running environment
export default {
  env: env,
  debug: debug,
  applicationName: "msg-session-manager",
  jwt: {
    algorithm: 'HS256',      // signature and hash algorithm
    secret: secret,          // secret for signature signing and verification. can be replaced with certificate.
    audience: "ibc",         // target the token is issued for
    subject: "fm auth",      // subject the token is issued for
    issuer: "bex msg",       // issuer of the token
    headers: { role: 'dir' },// custom information
    timeout: 3000            // timespan in seconds btw socket connect and authenticate, timeout cause disconnect
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
  fm: {
    id: fm_id,
    ip: fm_ip,
    port: fm_port
  },
  port: 9090
};
