'use strict';

import logger from './utils/logger'
import { ValidationError, ActiveSessionFoundError } from './utils/errors'

const log = logger.child({module: 'fm_seletor_factory'});

export default function(opts) {
  const { repo, policy, token } = opts;

  function handleError(err, newErr) {
    if (err) {
      log.error(err);
    }
    if (newErr && typeof newErr === 'string') {
      throw new Error(newErr);
    }
    else if (newErr && typeof newErr === 'error') {
      throw newErr;
    }
  }

  function get_ticket(user, conn, session) {
    let err_msg = 'error generating token';

    return policy.get_fm(user, conn).then(
      (fm) => {
        log.debug('front machine %s obtained', fm.id);
        let payload = { fm: fm, user: user, conn: conn, session_id: session.id };

        return token.generate(payload).then(
          (token) => {
            log.debug('token generated');
            return { fm_ip: fm.ip, fm_port: fm.port, token: token };
          });
      },
      (err) => {
        handleError(err, err_msg);
      });
  }

  function handleValidation(user, conn) {
    if (!user) throw new ValidationError('bad user');
    if (!user.user_id) throw new ValidationError('bad user id');
    if (!user.device_id) throw new ValidationError('bad device id');

    if (!conn) throw new ValidationError('bad connection');
    if (!conn.ip) throw new ValidationError('bad connection ip');
  }

  return {
    allocate: function(user, conn) {
      return new Promise((resolve, reject) => {

        handleValidation(user, conn);

        return repo.allocate_session(user, conn).then(
          (result) => {
            if (result.session.status == 'new') {
              log.debug('new session created');
            } else if (result.session.status == 'inactive') {
              log.debug('inactive session found');
            } else if (result.session.status == 'active') {
              //TBD is best to signal manager to close current active session and return a new one.
              //this can be achieved async, here we only make a close request
              //then close the old session and create a new session
              //manager can pick up the close request later
              handleError(null, new ActiveSessionFoundError());
            } else {
              handleError(null, 'unknown session state');
            }

            log.debug('generating new token for session');
            return get_ticket(user, conn, result.session);
          },
          (err) => {
            handleError(err, 'fail on accessing session state');
          }).then(
            (ticket) => {
              log.debug('session allocated');
              return resolve(ticket);
            },
            (err) => {
              log.debug('error allocating session');
              return reject(err);
            });
      });
    }
  };
}
