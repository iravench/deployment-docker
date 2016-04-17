'use strict';

import logger from './utils/logger'
import { FrontMachineIdInUseError } from './utils/errors'

const log = logger.child({widget_type: 'fm_register_factory'});

function handleRepositoryError(err) {
  let err_msg = 'error accessing fm registration repository';
  log.trace(err, err_msg);
  throw new Error(err_msg);
}

export default function(config) {
  const { repo } = config;

  return {
    register: function(fm_id, fm_ip, fm_port) {
      return repo.get_fm_record(fm_id).then(
        (result) => {
          if (result && result.fm_id) {
            log.trace('fm_id already in use');
            throw new FrontMachineIdInUseError();
          } else {
            return repo.set_fm_record(fm_id, fm_ip, fm_port).then(
              () => {
                log.trace('fm_id registered');
              },
              (err) => {
                handleRepositoryError(err);
              });
          }
        },
        (err) => {
          handleRepositoryError(err);
        });
    },
    deregister: function(fm_id) {
      return repo.delete_fm_record(fm_id).then(
        () => {
          log.trace('fm_id deregistered');
        },
        (err) => {
          handleRepositoryError(err);
        });
    }
  };
}
