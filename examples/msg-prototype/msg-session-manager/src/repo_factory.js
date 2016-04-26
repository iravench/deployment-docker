'use strict';

import logger from './utils/logger'
import { RepositoryError } from './utils/errors'

const log = logger.child({module: 'repo_factory'});

function handleStorageError(err, err_msg) {
  log.error(err);
  throw new RepositoryError(err_msg);
}

export default function(opts) {
  const { impl } = opts;

  return {
    activate_session: function(session_id, fm_id, socket_id) {
      let err_msg = 'error activating session record';

      log.debug('getting inactive session record by session_id %s', session_id);
      return impl.get_inactive_session(session_id).then(
        (result) => {
          if (!result) {
            log.debug('inactive session record by session_id %s not found', session_id);
            return { status: 'NotFound' };
          }
          else {
            log.debug('setting session record by session_id %s as activated', session_id);
            return impl.activate_session(session_id, fm_id, socket_id).then(
              () => {
                log.debug('session record by session_id %s set as activated', session_id);
                return { status: 'Activated' };
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
    close_session: function(socket_id) {
      let err_msg = 'error closing session record';

      log.debug('closing session record by socket_id %s', socket_id);
      return impl.close_session(socket_id).then(
        () => {
          log.debug('session record by socket_id %s closed', socket_id);
          return;
        },
        (err) => {
          handleStorageError(err, err_msg);
        });
    },
    close_all_fm_sessions: function(fm_id) {
      let err_msg = 'error closing front machine related session records';

      log.debug('closing session records related to front machine id %s', fm_id);
      return impl.close_fm_sessions(fm_id).then(
        () => {
          log.debug('session records related to front machine id %s closed', fm_id);
          return;
        },
        (err) => {
          handleStorageError(err, err_msg);
        });
    },
    get_fm_record: function(fm_id) {
      let err_msg = 'error getting front machine registration record';

      log.debug('getting front machine registration record by id %s', fm_id);
      return impl.get_fm_registration(fm_id).then(
        (result) => {
          if (!result || !result.id) {
            log.debug('front machine registration record by id %s not found', fm_id);
            return;
          } else {
            log.debug('front machine registration record by id %s found', fm_id);
            return { fm_id: result.id };
          }
        },
        (err) => {
          handleStorageError(err, err_msg);
        });
    },
    set_fm_record: function(fm_id, fm_ip, fm_port) {
      let err_msg = 'error setting front machine registration record';

      log.debug('setting front machine registration record by id %s', fm_id);
      return impl.set_fm_registration(fm_id, fm_ip, fm_port).then(
        () => {
          log.debug('front machine registration record by id %s set', fm_id);
          return;
        },
        (err) => {
          handleStorageError(err, err_msg);
        });
    },
    delete_fm_record: function(fm_id) {
      let err_msg = 'error deleting front machine registration record';

      log.debug('deleting front machine registration record by id %s', fm_id);
      return impl.delete_fm_registration(fm_id).then(
        () => {
          log.debug('front machine registration record by id %s deleted', fm_id);
          return;
        },
        (err) => {
          handleStorageError(err);
        });
    }
  };
}
