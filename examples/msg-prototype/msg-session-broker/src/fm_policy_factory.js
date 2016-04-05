'use strict';

import logger from './utils/logger'

const log = logger.child({widget_type: 'fm_policy_factory'});

// single user policy: maximum active session...
// single server policy: maximum ws connection...

export default function(config) {
  const { impl } = config;

  return {
    // get available front machine info
    get_fm: function() {
      // check: known servers' current load
      // opts might contain other flags or user/conn info, for maybe blacklist
      return impl.fm;
    }
  };
}
