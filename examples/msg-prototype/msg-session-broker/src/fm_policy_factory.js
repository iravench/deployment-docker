'use strict';

import config from './config';
import logger from './utils/logger'
import { NoAvailableFrontMachineError } from './utils/errors'
import _ from 'lodash';

const log = logger.child({module: 'fm_policy_factory'});

// possible configuration:
//   single user policy: maximum active session, ...
//   single server policy: maximum ws connection, ...
//   etc.

export default function(opts) {
  const defaults = config.policy;
  const options = Object.assign({}, defaults, opts)
  const { repo } = options;

  return {
    // get available front machines
    // check known servers' current load
    // opts might contain other flags for user/conn, for example certain user might be blacklist
    get_fm: function(user, conn) {
      log.debug('getting registered front machine list');
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
            log.debug('%s available front machines located', result.length);
            if (result.length > 1) {
              sorted_fms = _.sortBy(result, ['loads'], ['asc']);
            }
            let fm = sorted_fms[0];
            log.debug('the least loaded fm is ' + sorted_fms[0].fm_id);
            return { id: fm.fm_id, ip: fm.fm_ip, port: fm.fm_port };
          } else {
            throw new NoAvailableFrontMachineError();
          }
        },
        (err) => {
          log.error(err);
          let err_msg = 'error obtaining front machine';
          throw new Error(err_msg);
        });
    }
  };
}
