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
      let cb = (err) => { expect(err.message).to.have.string('bad user'); }
      fm_selector.allocate(null, null, cb);
    });

    it('invalidate user parameter without user_id', () => {
      let invalid_user = { device_id: 'device_id' };
      let cb = (err) => { expect(err.message).to.have.string('bad user id'); }
      fm_selector.allocate(invalid_user, null, cb);
    });

    it('invalidate user parameter without device_id', () => {
      let invalid_user = { user_id: 'user_id' };
      let cb = (err) => { expect(err.message).to.have.string('bad device id'); }
      fm_selector.allocate(invalid_user, null, cb);
    });

    it('invalidate empty connection parameter', () => {
      let cb = (err) => { expect(err.message).to.have.string('bad connection'); }
      fm_selector.allocate(valid_user, null, cb);
    });

    it('invalidate connection parameter without ip', () => {
      let invalid_conn = {};
      let cb = (err) => { expect(err.message).to.have.string('bad connection ip'); }
      fm_selector.allocate(valid_user, invalid_conn, cb);
    });
  });

  describe('#allocate session', () => {
    before(() => {
      repo.reset();
    });

    it('allow only one active sessions per one user/device/ip combo', () => {
      let cb_for_valid_call = (err, result) => {
        expect(err).to.be.null;
        expect(result).to.exist;
        expect(result.fm_ip).to.exist;
        expect(result.token).to.exist;
      };
      fm_selector.allocate(valid_user, valid_conn, cb_for_valid_call);

      let cb_for_repeated_call = (err) => { expect(err.message).to.have.string('active session found'); }
      fm_selector.allocate(valid_user, valid_conn, cb_for_repeated_call);
    });
  });
});
