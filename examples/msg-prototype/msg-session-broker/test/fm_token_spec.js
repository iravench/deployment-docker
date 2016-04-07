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
    it('generate a valid token', () => {
      const impl = { sign: () => {} };
      sinon.stub(impl, 'sign').returns(Promise.resolve(fixture.token));
      const fm_token = fm_token_factory({ impl: impl });
      return fm_token
        .generate(fixture.payload)
        .then(result => {
          expect(result).to.equal(fixture.token);
        });
    });
  });
});
