'use strict';

import _ from 'lodash';

let store = { sessions: [] };
let flag_to_fail = false;

const valid_user = { user_id: 'user_id', device_id: 'device_id' };
const valid_conn = { ip: '192.168.1.111' };
// fm_ip should be obtained via interaction with defined policy
const fm_ip = '111.111.111.111';

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
      user_id: valid_user.user_id,
      device_id: valid_user.device_id,
      ip: valid_conn.ip,
      fm_ip: fm_ip,
      status: 'inactive'
    });
  },
  prepare_active_session: function() {
    store.sessions.push({
      user_id: valid_user.user_id,
      device_id: valid_user.device_id,
      ip: valid_conn.ip,
      fm_ip: fm_ip,
      status: 'active'
    });
  },
  allocate_session: function(user, conn, policy, cb) {
    try
    {
      if (flag_to_fail) throw new Error('intended db failed');

      const index = _.findIndex(store.sessions, (s) => {
        return (
          s.user_id == user.user_id &&
          s.device_id == user.device_id &&
          s.ip == conn.ip &&
          s.status != 'closed'
        );
      });

      if (index >=0) {
        let found_session = store.sessions[index];
        if (found_session.status == 'active') {
          return cb(null, { active_session: store.sessions[index] });
        } else {
          return cb(null, { inactive_session: store.sessions[index] });
        }
      }
      else {
        const new_session = {
          user_id: user.user_id,
          device_id: user.device_id,
          ip: conn.ip,
          fm_ip: fm_ip,
          status: 'inactive'
        };
        store.sessions.push(new_session);
        return cb(null, { new_session: new_session });
      }
    } catch (err) {
      console.log(err);
      cb(err);
    }
  }
}
