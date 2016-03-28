'use strict';

import logger from './utils/logger'
import { ValidationError } from './utils/errors'

const log = logger.child({widget_type: 'fm_seletor_factory'});

export default function(config) {
  const { repo, policy, token } = config;

  function get_ticket(session) {
    const a_token = token.generate(session);
    return { fm_ip: session.fm_ip, token: a_token };
  }

  return {
    allocate: function(user, conn) {
      return new Promise((resolve, reject) => {
        if (!user) return reject(new ValidationError('bad user'));
        if (!user.user_id) return reject(new ValidationError('bad user id'));

        if (!user.device_id) return reject(new ValidationError('bad device id'));

        if (!conn) return reject(new ValidationError('bad connection'));
        if (!conn.ip) return reject(new ValidationError('bad connection ip'));

        // TBD only new session require fm, should we optimize this?
        const fm = policy.get_fm(user, conn);

        return repo.allocate_session(user, conn, fm).then(
          (result) => {
            if (result.session.status == 'inactive') {
              log.trace('session state: inactive session found');
              let ticket = get_ticket(result.session);
              log.trace('ticket returned');
              return ticket;
            }

            if (result.session.status == 'active') {
              let err_msg = 'session state: active session found';
              log.trace(err_msg);
              throw new Error(err_msg);
            }

            if (result.session.status == 'new') {
              log.trace('session state: new session created');
              let ticket = get_ticket(result.session);
              log.trace('ticket returned');
              return ticket;
            }

            let err_msg = 'session state: unknown';
            log.trace(err_msg);
            throw new Error(err_msg);
          },
          (err) => {
            throw err;
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
