'use strict';

import logger from './utils/logger'
import { RepositoryError } from './utils/errors'

const log = logger.child({widget_type: 'session_repo_factory'});

export default function(config) {
  const { impl } = config;
  return {
    allocate_session: function(user, conn, fm) {
      return impl.get_none_closed_session(user, conn).then(
        (found_session) => {
          if (found_session) {
            if (found_session.status == 'active')
              return { active_session: found_session };
            else
              return { inactive_session: found_session };
          }
          else {
            return impl.create_new_session(user, conn, fm).then(
              (new_session) => {
                return { new_session: new_session };
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
