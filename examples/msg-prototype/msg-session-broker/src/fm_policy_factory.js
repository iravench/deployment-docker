'use strict';

import config from './config';
import logger from './utils/logger'

const log = logger.child({widget_type: 'fm_policy_factory'});

// possible configuration:
//   single user policy: maximum active session, ...
//   single server policy: maximum ws connection, ...
//   etc.

export default function(options) {
  const defaults = config.policy;
  const opts = Object.assign({}, defaults, options)
  const { impl } = opts;

  return {
    // get available front machine info
    get_fm: function(user, conn) {
      return new Promise((resolve, reject) => {
        // check: known servers' current load
        // opts might contain other flags or user/conn info, for maybe blacklist
        return resolve(impl.fm);
      });
    }
  };
}
