'use strict';

import config from './config';
import jwt from 'jsonwebtoken';

export default function(options = {}) {
  const defaults = config.jwt;
  const opts = Object.assign({}, defaults, options)

  return {
    generate: function(payload) {
      return new Promise((resolve,reject) => {
        if (!payload) return reject(new Error('empty payload'));
        // other validations

        jwt.sign(payload, opts.secret, opts, (token) => {
          return resolve(token);
        });
      });
    }
  };
}
