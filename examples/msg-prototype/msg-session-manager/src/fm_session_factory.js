'use strict';

import logger from './utils/logger'
import { SessionAlreadyActivatedError } from './utils/errors'

const log = logger.child({widget_type: 'fm_seletor_factory'});

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
          let err_msg = 'error accessing session';
          log.trace(err, err_msg);
          throw new Error(err_msg);
        });
    },
    deactivate: function(socket_id) {
      return repo.close_session(socket_id).then(() => {
        log.trace('session closed by socket id');
      },
      (err) => {
        let err_msg = 'error deactivating socket session';
        log.trace(err, err_msg);
      });
    }
  };
}
