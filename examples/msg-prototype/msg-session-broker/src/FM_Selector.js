'use strict';

import log from './utils/logger'
import fm_token from './fm_token';
import fm_policy from './fm_policy';

function get_allocation_handler(cb) {
  return (err, result) => {
    if (err) {
      log.error(err);
      return cb(new Error('failed on retrieving session status'));
    }

    if (result.inactive_session && !result.active_session && !result.new_session) {
      let inactive_session = result.inactive_session;
      let token = fm_token.generate(inactive_session);
      let ticket = { fm_ip: inactive_session.fm_ip, token: token };
      log.info('inactive ticket retrieved');
      return cb(null, ticket);
    }

    if (result.active_session && !result.inactive_session && !result.new_session) {
      return cb(new Error('active session already exist'));
    }

    if (result.new_session && !result.inactive_session && !result.active_session) {
      let new_session = result.new_session;
      let token = fm_token.generate(new_session);
      let ticket = { fm_ip: new_session.fm_ip, token: token };
      log.info('new ticket created');
      return cb(null, ticket);
    }

    return cb(new Error('unknown error'));
  }
}

export default function(session_repo) {
  return {
    allocate: function(user, conn, cb) {
      if (!user) throw new Error('bad user');
      if (!user.user_id) throw new Error('bad user id');
      if (!user.device_id) throw new Error('bad device id');

      if (!conn) throw new Error('bad connection');
      if (!conn.ip) throw new Error('bad connection ip');

      session_repo.allocate_session(user, conn, fm_policy, get_allocation_handler(cb));
    }
  };
}
