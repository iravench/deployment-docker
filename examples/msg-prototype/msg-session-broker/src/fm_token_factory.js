'use strict';

import config from './config';
import logger from './utils/logger'

const log = logger.child({module: 'fm_token_factory'});

export default function(opts) {
  const defaults = config.jwt;
  const options = Object.assign({}, defaults, opts)
  const { impl } = options;

  function handleValidation(payload) {
    if (!payload) throw new Error('empty payload');

    // other validations
  }

  return {
    generate: function(payload) {
      return new Promise((resolve) => {

        handleValidation(payload);

        log.debug('signing payload');
        return impl.sign(payload, options).then(
          (token) => {
            log.debug('signed token generated');
            return resolve(token);
          });
      });
    }
  };
}
