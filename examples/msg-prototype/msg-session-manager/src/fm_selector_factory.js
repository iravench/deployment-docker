'use strict';

import logger from './utils/logger'
import { SessionAlreadyActivatedError } from './utils/errors'

const log = logger.child({widget_type: 'fm_seletor_factory'});

export default function(config) {
  const { repo } = config;

  function handleError(err_msg, err) {
    if (err) {
      log.trace(err, err_msg);
    } else {
      log.trace(err_msg);
    }
    throw new Error(err_msg);
  }

  return {
    activate: function(decodedToken, socket_id) {
      return new Promise((resolve, reject) => {
        return repo.activate_session(decodedToken.session_id, decodedToken.fm.id, socket_id).then(
          (result) => {
            if (result.status == 'activated') {
              log.trace('session activated');
            } else {
              log.trace('non inactive session by that id can be found');
              throw new SessionAlreadyActivatedError();
            }

            return decodedToken.session_id;
          },
          (err) => {
            // handle errors from repository which are of lower abstraction level
            handleError('fail on accessing session state', err);
          }).then(
            (id) => {
              log.trace('session activated');
              return resolve(id);
            },
            (err) => {
              log.trace('session activation error');
              return reject(err);
            });
      });
    }
  };
}
