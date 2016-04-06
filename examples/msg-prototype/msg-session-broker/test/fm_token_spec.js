'use strict';

import sinon from 'sinon';
import { expect } from 'chai';

import fm_token_factory from '../src/fm_token_factory';
import fixture from './fixture/fm_token.js';

import jwt from 'jsonwebtoken';
import config from '../src/config';

describe('fm_token', () => {
  describe('#generate validation', () => {
    const fm_token = fm_token_factory();

    it('response to generate', () => {
      expect(fm_token).to.respondTo('generate');
    });

    it('invalidate empty payload', () => {
      return fm_token
        .generate()
        .catch(err => { expect(err.message).to.have.string('empty payload'); });
    });
  });

  describe('#generate token', () => {
    it('generate a valid jwt token', (done) => {
      const fm_token = fm_token_factory();
      return fm_token
        .generate(fixture.payload)
        .then(result => {
          expect(result).to.exist;

          jwt.verify(result, config.jwt.secret, config.jwt, (error, payload) => {
            expect(payload).to.exist;
            expect(payload.session_id).to.equal(fixture.payload.session_id);
            done();
          });
        });
    });
  });
});
