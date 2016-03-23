'use strict';

import { expect } from 'chai';
import repo from './fixture/session_repo';
import FM_Selector from '../src/FM_Selector';

const fm_selector = new FM_Selector(repo);

describe('fm_selector', () => {
  const valid_user = { user_id: 'user_id', device_id: 'device_id' };
  const valid_conn = { ip: '192.168.1.111' };

  describe('#allocate validation', () => {
    before(() => {
      repo.reset();
    });

    it('response to allocate', () => {
      expect(fm_selector).to.respondTo('allocate');
    });

    it('invalidate empty user parameter', () => {
      expect(fm_selector.allocate.bind(fm_selector)).to.throw(/bad user/);
    });

    it('invalidate user parameter without user_id', () => {
      let invalid_user = { device_id: 'device_id' };
      expect(fm_selector.allocate.bind(fm_selector, invalid_user)).to.throw(/bad user id/);
    });

    it('invalidate user parameter without device_id', () => {
      let invalid_user = { user_id: 'user_id' };
      expect(fm_selector.allocate.bind(fm_selector, invalid_user)).to.throw(/bad device id/);
    });

    it('invalidate empty connection parameter', () => {
      expect(fm_selector.allocate.bind(fm_selector, valid_user)).to.throw(/bad connection/);
    });

    it('invalidate connection parameter without ip', () => {
      let invalid_conn = {};
      expect(fm_selector.allocate.bind(fm_selector, valid_user, invalid_conn)).to.throw(/bad connection ip/);
    });
  });

  describe('#allocate session', () => {
    before(() => {
      repo.reset();
    });

    it('allow only one active sessions per one user/device/ip combo', () => {
      let cb_with_result = (err, result) => {
        expect(result).to.exist;
      };
      fm_selector.allocate(valid_user, valid_conn, cb_with_result);

      let cb_with_error = (err, result) => {
        expect(err).to.exist;
      };
      fm_selector.allocate(valid_user, valid_conn, cb_with_error);
    });
  });
});
