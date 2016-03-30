'use strict';

import logger from './utils/logger'
import { RepositoryError } from './utils/errors'

const log = logger.child({widget_type: 'repo_factory'});

export default function(config) {
  const { impl } = config;
  return {
    get_by: function(session_id) {
      return impl.get_by(session_id).then(
        (session) => {
          if (!session) {
            let err_msg = 'fail on locating session record by id';
            log.trace(err_msg);
            throw new RepositoryError(err_msg);
          }
          return { session: session };
        },
        (err) => {
          let err_msg = 'fail on accessing session storage';
          log.trace(err, err_msg);
          throw new RepositoryError(err_msg);
        });
    },
    activate: function(session_id, socket_id, fm_id) {
      return impl.activate(session_id, socket_id, fm_id).then(
        (session) => {
          if (!session) {
            let err_msg = 'fail on activating session record by id';
            log.trace(err_msg);
            throw new RepositoryError(err_msg);
          }
          return { session: session };
        },
        (err) => {
          let err_msg = 'fail on accessing session storage';
          log.trace(err, err_msg);
          throw new RepositoryError(err_msg);
        });
    }
  };
}
