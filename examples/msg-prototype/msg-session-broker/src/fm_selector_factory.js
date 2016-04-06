'use strict';

import logger from './utils/logger'
import { ValidationError } from './utils/errors'

const log = logger.child({widget_type: 'fm_seletor_factory'});

export default function(config) {
  const { repo, policy, token } = config;

  function get_ticket(user, conn, session) {
    const fm = policy.get_fm({ user: user, conn: conn });
    const payload = { fm: fm, user: user, conn: conn, session_id: session.id };
    return token.generate(payload).then((token) => {
      log.trace('ticket returned');
      return { fm_ip: fm.ip, token: token };
    });
  }

  return {
    allocate: function(user, conn) {
      return new Promise((resolve, reject) => {

        if (!user) return reject(new ValidationError('bad user'));
        if (!user.user_id) return reject(new ValidationError('bad user id'));
        if (!user.device_id) return reject(new ValidationError('bad device id'));

        if (!conn) return reject(new ValidationError('bad connection'));
        if (!conn.ip) return reject(new ValidationError('bad connection ip'));

        return repo.allocate_session(user, conn).then(
          (result) => {
            if (result.session.status == 'new') {
              log.trace('new session created');
            } else if (result.session.status == 'inactive') {
              log.trace('inactive session found');
            } else if (result.session.status == 'active') {
              let err_msg = 'active session found';
              log.trace(err_msg);
              throw new Error(err_msg);
            } else {
              let err_msg = 'unknown state';
              log.trace(err_msg);
              throw new Error(err_msg);
            }

            return get_ticket(user, conn, result.session);
          },
          (err) => {
            let err_msg = 'fail on accessing session state';
            log.trace(err, err_msg);
            throw new Error(err_msg);
          }).then(
            (ticket) => {
              resolve(ticket);
            },
            (err) => {
              reject(err);
            });
      });
    }
  };
}
