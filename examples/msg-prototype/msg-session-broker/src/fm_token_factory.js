'use strict';

import config from './config';
import logger from './utils/logger'
import jwt from 'jsonwebtoken';

const log = logger.child({widget_type: 'fm_token_factory'});

export default function(options = {}) {
  const defaults = config.jwt;
  const opts = Object.assign({}, defaults, options)

  function handleValidation(payload) {
    if (!payload) throw new Error('empty payload');

    // other validations
  }

  return {
    generate: function(payload) {
      return new Promise((resolve) => {

        handleValidation(payload);

        jwt.sign(payload, opts.secret, opts, (token) => {
          log.trace('token generated');
          return resolve(token);
        });
      });
    }
  };
}
