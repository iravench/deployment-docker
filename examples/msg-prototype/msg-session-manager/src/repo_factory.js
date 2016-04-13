'use strict';

import logger from './utils/logger'
import { RepositoryError } from './utils/errors'

const log = logger.child({widget_type: 'repo_factory'});

export default function(config) {
  const { impl } = config;
  return {
    activate_session: function(session_id, fm_id, socket_id) {
      return impl.get_inactive_session(session_id).then(
        (result) => {
          if (!result) {
            return { status: 'not found' };
          }
          else {
            return impl.activate_session(session_id, fm_id, socket_id).then(
              (result) => {
                return { status: 'activated' };
              },
              (err) => {
                let err_msg = 'error accessing session storage';
                log.trace(err, err_msg);
                throw new RepositoryError(err_msg);
              });
          }
        },
        (err) => {
          let err_msg = 'error accessing session storage';
          log.trace(err, err_msg);
          throw new RepositoryError(err_msg);
        });
    }
  };
}
