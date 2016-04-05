'use strict';

import logger from './utils/logger'
import { RepositoryError } from './utils/errors'

const log = logger.child({widget_type: 'repo_factory'});

export default function(config) {
  const { impl } = config;
  return {
    allocate_session: function(user, conn) {
      return impl.get_none_closed_session(user, conn).then(
        (session) => {
          if (session) {
            return { session: session };
          }
          else {
            return impl.create_new_session(user, conn).then(
              (new_session) => {
                // override 'inactive' to 'new' from application level
                // to indicate that this session is in fact newly created
                new_session.status = 'new';
                return { session: new_session };
              },
              (err) => {
                let err_msg = 'fail on creating new session data';
                log.trace(err, err_msg);
                throw new RepositoryError(err_msg);
              });
          }
        },
        (err) => {
          let err_msg = 'fail on accessing session storage';
          log.trace(err, err_msg);
          throw new RepositoryError(err_msg);
        });
    }
  };
}
