'use strict';

import logger from './utils/logger'
import fm_token from './fm_token';
import fm_policy from './fm_policy';

const log = logger.child({widget_type: 'fm_seletor'});

function get_allocation_callback(cb) {
  return (err, result) => {
    if (err) {
      let err_msg = 'session state: undetermined';
      log.trace(err, err_msg);
      return cb(new Error(err_msg));
    }

    if (result.inactive_session) {
      log.trace('session state: inactive session found');
      let ticket = get_ticket(result.inactive_session);
      log.trace('ticket returned');
      return cb(null, ticket);
    }

    if (result.active_session) {
      let err_msg = 'session state: active session found';
      log.trace(err_msg);
      return cb(new Error(err_msg));
    }

    if (result.new_session) {
      log.trace('session state: new session created');
      let ticket = get_ticket(result.new_session);
      log.trace('ticket returned');
      return cb(null, ticket);
    }

    let err_msg = 'session state: unknown';
    log.trace(err_msg);
    return cb(new Error(err_msg));
  }
}

function get_ticket(session) {
  let token = fm_token.generate(session);
  return { fm_ip: session.fm_ip, token: token };
}

export default function(session_repo) {
  return {
    allocate: function(user, conn, cb) {
      if (!user) return cb(new Error('bad user'));
      if (!user.user_id) return cb(new Error('bad user id'));

      if (!user.device_id) return cb(new Error('bad device id'));

      if (!conn) return cb(new Error('bad connection'));
      if (!conn.ip) return cb(new Error('bad connection ip'));

      return session_repo.allocate_session(user, conn, fm_policy, get_allocation_callback(cb));
    }
  };
}
