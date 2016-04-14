'use strict';

import logger from './utils/logger'
import { RepositoryError } from './utils/errors'

const log = logger.child({widget_type: 'repo_factory'});

function handleStorageError(err) {
  let err_msg = 'error accessing session repository';
  log.trace(err, err_msg);
  throw new RepositoryError(err_msg);
}

export default function(config) {
  const { impl } = config;
  return {
    activate_session: function(session_id, fm_id, socket_id) {
      return impl.get_inactive_session(session_id).then(
        (result) => {
          if (!result) {
            return { status: 'NotFound' };
          }
          else {
            return impl.activate_session(session_id, fm_id, socket_id).then(
              () => {
                return { status: 'Activated' };
              },
              (err) => {
                handleStorageError(err);
              });
          }
        },
        (err) => {
          handleStorageError(err);
        });
    },
    close_session: function(socket_id) {
      return impl.close_session(socket_id).catch((err) => {
        handleStorageError(err);
      });
    }
  };
}
