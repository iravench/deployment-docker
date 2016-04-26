'use strict';

import jwt from 'jsonwebtoken';
import logger from '../utils/logger'

const log = logger.child({module: 'fm_token_impl'});

export default {
  sign: function(payload, options) {
    return new Promise((resolve, reject) => {
      return jwt.sign(payload, options.secret, options, (token) => {
        log.debug('jwt token generated');
        return resolve(token);
      });
    });
  }
}
