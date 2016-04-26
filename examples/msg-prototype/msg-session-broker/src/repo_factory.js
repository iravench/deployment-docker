'use strict';

import logger from './utils/logger'
import { RepositoryError } from './utils/errors'

const log = logger.child({module: 'repo_factory'});

export default function(opts) {
  const { impl } = opts;

  function handleStorageError(err, err_msg) {
    log.error(err);
    throw new RepositoryError(err_msg);
  }

  return {
    allocate_session: function(user, conn) {
      let err_msg = 'error allocating non-closed session record';

      log.debug('getting non-closed session record');
      return impl.get_none_closed_session(user, conn).then(
        (session) => {
          if (session) {
            log.debug('non-closed session record found');
            return { session: session };
          }
          else {
            log.debug('creating new session record');
            return impl.create_new_session(user, conn).then(
              (new_session) => {
                // override 'inactive' to 'new' from application level
                // to indicate that this session is in fact newly created
                new_session.status = 'new';
                log.debug('new session record created');
                return { session: new_session };
              },
              (err) => {
                handleStorageError(err, err_msg);
              });
          }
        },
        (err) => {
          handleStorageError(err, err_msg);
        });
    },
    get_registered_fms: function() {
      let err_msg = 'error getting registered front machine records';

      log.debug('getting registered front machine records');
      return impl.get_fm_registrations().then(
        (result) => {
          if (!result || result.length <= 0) {
            log.debug('registered front machine records not found');
            return;
          } else {
            log.debug('registered front machine records found');
            return result;
          }
        },
        (err) => {
          handleStorageError(err, err_msg);
        });
    }
  };
}
