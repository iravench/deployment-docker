'use strict';

import logger from './utils/logger'
import { SessionAlreadyActivatedError } from './utils/errors'

const log = logger.child({widget_type: 'fm_seletor_factory'});

function handleRepositoryError() {
  let err_msg = 'error accessing session repository';
  log.trace(err, err_msg);
  throw new Error(err_msg);
}

export default function(config) {
  const { repo } = config;

  return {
    activate: function(decodedToken, socket_id) {
      return repo.activate_session(decodedToken.session_id, decodedToken.fm.id, socket_id).then(
        (result) => {
          if (result.status == 'Activated') {
            log.trace('session activated');
          } else {
            log.trace('no inactive session found');
            throw new SessionAlreadyActivatedError();
          }

          return decodedToken.session_id;
        },
        (err) => {
          handleRepositoryError();
        });
    },
    deactivate: function(socket_id) {
      return repo.close_session(socket_id).then(() => {
        log.trace('session closed by socket id');
      },
      (err) => {
        handleRepositoryError();
      });
    },
    close_all: function(fm_id) {
      return repo.close_all_fm_sessions(fm_id).then(() => {
        log.trace('sessions closed by fm id');
      },
      (err) => {
        handleRepositoryError();
      });
    }
  };
}
