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
  const { repo } = opts;

  return {
    // get available front machines
    // check known servers' current load
    // opts might contain other flags or user/conn info, for maybe blacklist
    //
    get_fm: function(user, conn) {
      return repo.get_registered_fms().then(
        (result) => {
          if (result) {
            return { id: result[0].fm_id, ip: result[0].fm_ip };
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
