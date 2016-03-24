'use strict';

import _ from 'lodash';

let store = { sessions: [] };

export default {
  reset: function() {
    store = { sessions: [] };
  },
  allocate_session: function(user, conn, policy, cb) {
    const index = _.findIndex(store.sessions, (s) => {
      return s.user_id == user.user_id && s.device_id == user.device_id && s.ip == conn.ip;
    });

    if (index >=0) {
      return cb(null, { active_session: store.sessions[index] });
    }
    else {
      // fm_ip is returned by interacting with defined policy
      let fm_ip = '111.111.111.111';
      const new_session = { user_id: user.user_id, device_id: user.device_id, ip: conn.ip, fm_ip: fm_ip };
      store.sessions.push(new_session);
      return cb(null, { new_session: new_session });
    }
  }
}
