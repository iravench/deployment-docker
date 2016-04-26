'use strict';

import logger from './utils/logger'
import { SessionInUseError } from './utils/errors'

const log = logger.child({module: 'fm_session_factory'});

export default function(opts) {
  const { repo } = opts;

  function handleRepositoryError(err, err_msg) {
    log.error(err);
    throw new Error(err_msg);
  }

  return {
    activate: function(decodedToken, socket_id) {
      let err_msg = 'error activating session record';

      log.debug('activating session record');
      return repo.activate_session(decodedToken.session_id, decodedToken.fm.id, socket_id).then(
        (result) => {
          if (result.status == 'Activated') {
            log.debug('session record by id %s activated', decodedToken.session_id);
          } else {
            log.debug('session record by id %s not found or already active', decodedToken.session_id);
            throw new SessionInUseError();
          }

          return decodedToken.session_id;
        },
        (err) => {
          handleRepositoryError(err, err_msg);
        });
    },
    deactivate: function(socket_id) {
      let err_msg = 'error deactivating session record by socket_id';

      log.debug('deactivating session record by socket_id %s', socket_id);
      return repo.close_session(socket_id).then(
        () => {
          log.debug('session record by socket_id %s deactived', socket_id);
        },
        (err) => {
          handleRepositoryError(err, err_msg);
        });
    },
    close_all: function(fm_id) {
      let err_msg = 'error closing all session records by fm_id';

      log.debug('closing all session records by fm_id %s', fm_id);
      return repo.close_all_fm_sessions(fm_id).then(
        () => {
          log.debug('all session records by fm_id %s closed', fm_id);
        },
        (err) => {
          handleRepositoryError(err, err_msg);
        });
    }
  };
}
