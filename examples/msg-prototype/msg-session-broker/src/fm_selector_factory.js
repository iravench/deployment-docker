'use strict';

import logger from './utils/logger'
import { ValidationError } from './utils/errors'

const log = logger.child({widget_type: 'fm_seletor_factory'});

export default function(config) {
  const { repo, policy, token } = config;

  function get_ticket(user, conn, session) {
    return policy.get_fm(user, conn).then(
      (fm) => {
        const payload = { fm: fm, user: user, conn: conn, session_id: session.id };
        return token.generate(payload).then(
          (token) => {
            return { fm_ip: fm.ip, token: token };
          });
      },
      (err) => {
        handleError('fail on obtaining front machine connection', err);
      });
  }

  function handleError(err_msg, lowerLvlErr) {
    if (lowerLvlErr) {
      log.trace(lowerLvlErr, err_msg);
    } else {
      log.trace(err_msg);
    }
    throw new Error(err_msg);
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
              log.trace('new session created');
            } else if (result.session.status == 'inactive') {
              log.trace('inactive session found');
            } else if (result.session.status == 'active') {
              //TBD is best to signal manager to close current active session and return a new one.
              //this can be achieved async, here we only make a close request
              //then close the old session and create a new session
              //manager can pick up the close request later
              handleError('active session found');
            } else {
              handleError('unknown state');
            }

            return get_ticket(user, conn, result.session);
          },
          (err) => {
            // handle errors from repository which are of lower abstraction level
            handleError('fail on accessing session state', err);
          }).then(
            (ticket) => {
              log.trace('session allocated');
              return resolve(ticket);
            },
            (err) => {
              log.trace('session allocation error');
              return reject(err);
            });
      });
    }
  };
}
