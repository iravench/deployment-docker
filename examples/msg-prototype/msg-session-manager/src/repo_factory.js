'use strict';

import logger from './utils/logger'
import { RepositoryError } from './utils/errors'

const log = logger.child({widget_type: 'session_repo_factory'});

export default function(config) {
  const { impl } = config;
  return {
    activate: function(user, conn, ticket) {
      return impl.activate(user, conn, ticket).then(
        (session) => {
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
