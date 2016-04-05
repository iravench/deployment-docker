'use strict';

import _ from 'lodash';
import logger from '../utils/logger'
import { StorageError } from '../utils/errors'

const log = logger.child({widget_type: 'repo_impl'});

const store = { sessions: [] };

export default {
  get_none_closed_session(user, conn) {
    return new Promise((resolve, reject) => {
      const index = _.findIndex(store.sessions, (s) => {
        return (
          s.user_id == user.user_id &&
          s.device_id == user.device_id &&
          s.ip == conn.ip &&
          s.status != 'closed'
        );
      });

      if (index >= 0)
        return resolve(store.sessions[index]);
      else
        return resolve(null);
    });
  },
  create_new_session: function(user, conn) {
    return new Promise((resolve, reject) => {
      const new_session = {
        id: 1,
        user_id: user.user_id,
        device_id: user.device_id,
        ip: conn.ip,
        status: 'inactive'
      };
      store.sessions.push(new_session);
      return resolve(new_session);
    });
  }
}
