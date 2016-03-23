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
      const new_session = { user_id: user.user_id, device_id: user.device_id, ip: conn.ip };
      store.sessions.push(new_session);
      return cb(null, { new_session: new_session });
    }
  }
}
