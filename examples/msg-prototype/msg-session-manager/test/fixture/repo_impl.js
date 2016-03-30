'use strict';

import _ from 'lodash';
import logger from '../../src/utils/logger'
import { StorageError } from '../../src/utils/errors'

const log = logger.child({widget_type: 'repo_impl'});

let store = { sessions: [] };
let flag_to_fail = false;

const valid_user = { user_id: 'user_id', device_id: 'device_id' };
const valid_conn = { ip: '192.168.1.111' };

export default {
  valid_user: valid_user,
  valid_conn: valid_conn,
  reset: function() {
    store = { sessions: [] };
    flag_to_fail = false;
  },
  mimic_db_failure: function() {
    flag_to_fail = true;
  },
  prepare_inactive_session: function() {
    store.sessions.push({
      id: 1,
      user_id: valid_user.user_id,
      device_id: valid_user.device_id,
      ip: valid_conn.ip,
      status: 'inactive'
    });
  },
  prepare_active_session: function() {
    store.sessions.push({
      id: 1,
      user_id: valid_user.user_id,
      device_id: valid_user.device_id,
      ip: valid_conn.ip,
      status: 'active'
    });
  },
  get_by(session_id) {
    return new Promise((resolve, reject) => {
      try
      {
        if (flag_to_fail) throw new Error('intended db failed');

        const index = _.findIndex(store.sessions, (s) => {
          return (
            s.id == session_id
          );
        });

        if (index >= 0) {
          return resolve(store.sessions[index]);
        } else {
          return resolve(null);
        }
      } catch (err) {
        let err_msg = 'fail on accessing storage';
        log.trace(err, err_msg);
        return reject(new StorageError(err_msg));
      }
    });
  },
  activate: function(session_id, socket_id, fm_id) {
    return new Promise((resolve, reject) => {
      try
      {
        if (flag_to_fail) throw new Error('intended db failed');

        const index = _.findIndex(store.sessions, (s) => {
          return (
            s.id == session_id
          );
        });

        if (index >= 0) {
          let session = store.sessions[index];
          session.status = 'active';
          session.socket_id = socket_id;
          session.fm_id = fm_id;
          return resolve(session);
        } else {
          return resolve(null);
        }
      } catch (err) {
        let err_msg = 'fail on accessing storage';
        log.trace(err, err_msg);
        return reject(new StorageError(err_msg));
      }
    });
  }
}
