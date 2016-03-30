'use strict';

// fake impl
import policy_impl from '../test/fixture/policy_impl';

// single user policy: maximum active session...
// single server policy: maximum ws connection...
export default {
// outputs: available front machine info
  get_fm: function(opts) {
    // check: known servers' current load
    // opts might contain other flags or user/conn info, for maybe blacklist
    return policy_impl.fm;
  }
}
