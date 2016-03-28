'use strict';

// fake impl
import repo_impl from '../test/fixture/session_repo_impl';
// single user policy: maximum active session...
// single server policy: maximum ws connection...
export default {
// inputs: known servers' current load
// outputs: available front machine info
  get_fm: function(user, conn) {
    return repo_impl.fm;
  }
}
