'use strict';

import config from './config';
import logger from './utils/logger'

const log = logger.child({widget_type: 'fm_token_factory'});

export default function(options) {
  const defaults = config.jwt;
  const opts = Object.assign({}, defaults, options)
  const { impl } = opts;

  function handleValidation(payload) {
    if (!payload) throw new Error('empty payload');

    // other validations
  }

  return {
    generate: function(payload) {
      return new Promise((resolve) => {

        handleValidation(payload);

        return impl.sign(payload, opts).then(
          (token) => {
            log.trace('token generated');
            return resolve(token);
          });
      });
    }
  };
}
