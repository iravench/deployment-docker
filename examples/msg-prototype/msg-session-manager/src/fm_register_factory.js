'use strict';

import logger from './utils/logger'
import { FrontMachineIdInUseError } from './utils/errors'

const log = logger.child({module: 'fm_register_factory'});

export default function(opts) {
  const { repo } = opts;

  function handleRepositoryError(err, err_msg) {
    log.error(err);
    throw new Error(err_msg);
  }

  return {
    register: function(fm_id, fm_ip, fm_port) {
      // TBD add validations
      let err_msg = 'error registering front machine record';

      log.debug('checking front machine registration record');
      return repo.get_fm_record(fm_id).then(
        (result) => {
          if (result && result.fm_id) {
            log.debug('front machine registration record found');
            throw new FrontMachineIdInUseError();
          } else {
            log.debug('setting front machine registration record');
            return repo.set_fm_record(fm_id, fm_ip, fm_port).then(
              () => {
                log.debug('front machine registration record set');
              },
              (err) => {
                handleRepositoryError(err, err_msg);
              });
          }
        },
        (err) => {
          handleRepositoryError(err, err_msg);
        });
    },
    deregister: function(fm_id) {
      log.debug('deleting front machine registration record');
      return repo.delete_fm_record(fm_id).then(
        () => {
          log.debug('front machine registration record deleted');
        },
        (err) => {
          handleRepositoryError(err, 'error deregistering front machine record');
        });
    }
  };
}
