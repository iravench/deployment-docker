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

  function handleError(err_msg, err) {
    if (err) log.trace(err, err_msg);
    else log.trace(err_msg);
    throw new Error(err_msg);
  }

  return {
    // get available front machines
    // check known servers' current load
    // opts might contain other flags for user/conn, for example certain user might be blacklist
    get_fm: function(user, conn) {
      return repo.get_registered_fms().then(
        (result) => {
          if (result) {
            //use the least loaded fm for new session
            //TBD notice this is a very naive impl
            //there is a gap between token issue and ws connection, the db reflected loads has a delay.
            //might want to distribute loads among more than 1 candidates
            //might want to take it easy when a fm loads reach certain level
            //might want to prioritize on newly joined fm, etc.
            let sorted_fms = result;
            if (result.length > 1) {
              sorted_fms = _.sortBy(result, ['loads'], ['asc']);
              log.trace('the least loaded fm is ' + sorted_fms[0].fm_id);
            }
            let fm = sorted_fms[0];
            return { id: fm.fm_id, ip: fm.fm_ip, port: fm.fm_port };
          } else {
            handleError('no available front machine at the moment');
          }
        },
        (err) => {
          handleError('error querying front machine repository', err);
        });
    }
  };
}
