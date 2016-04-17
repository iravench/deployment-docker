'use strict';

import config from './config';
import logger from './utils/logger'
import _ from 'lodash';

const log = logger.child({widget_type: 'fm_policy_factory'});

// possible configuration:
//   single user policy: maximum active session, ...
//   single server policy: maximum ws connection, ...
//   etc.

export default function(options) {
  const defaults = config.policy;
  const opts = Object.assign({}, defaults, options)
  const { repo } = opts;

  return {
    // get available front machines
    // check known servers' current load
    // opts might contain other flags for user/conn, for example certain user might be blacklist
    //
    get_fm: function(user, conn) {
      return repo.get_registered_fms().then(
        (result) => {
          if (result) {
            //use the least loaded fm for new session
            //TBD notice this is a very naive impl
            //there is a gap between token issued and ws connection, so the loads reflected has a delay.
            //might want to distribute loads to more than 1 candidates
            //might want to take it easy when loads reach certain point
            //might want to prioritize on newly joint fm, etc.
            let sorted_fms = result;
            if (result.length >= 1) {
              sorted_fms = _.sortBy(result, ['loads'], ['asc']);
            }
            return { id: sorted_fms[0].fm_id, ip: sorted_fms[0].fm_ip };
          } else {
            let err_msg = 'no available front machine at the moment';
            log.trace(err_msg);
            throw new Error(err_msg);
          }
        },
        (err) => {
          let err_msg = 'error querying front machine repository';
          log.trace(err, err_msg);
          throw new Error(err_msg);
        });
    }
  };
}
