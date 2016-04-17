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
    },
    close_all_fm_sessions: function(fm_id) {
      return impl.close_fm_sessions(fm_id).catch((err) => {
        handleStorageError(err);
      });
    },
    get_fm_record: function(fm_id) {
      return impl.get_fm_registration(fm_id).then(
        (result) => {
          if (!result || !result.id) {
            return;
          } else {
            return { fm_id: result.id };
          }
        },
        (err) => {
          handleStorageError(err);
        });
    },
    set_fm_record: function(fm_id, fm_ip, fm_port) {
      return impl.set_fm_registration(fm_id, fm_ip, fm_port).then(
        () => {
          return;
        },
        (err) => {
          handleStorageError(err);
        });
    },
    delete_fm_record: function(fm_id) {
      return impl.delete_fm_registration(fm_id).catch(
        (err) => {
          handleStorageError(err);
        });
    }
  };
}
