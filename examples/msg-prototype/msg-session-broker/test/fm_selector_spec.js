'use strict';

import { expect } from 'chai';
import repo_impl from './fixture/session_repo_impl';
import fm_token from '../src/fm_token';
import fm_policy from '../src/fm_policy';
import repo_factory from '../src/session_repo_factory';
import fm_selector_factory from '../src/fm_selector_factory';

const repo = repo_factory({ impl: repo_impl });
const fm_selector = fm_selector_factory({ repo: repo, policy: fm_policy, token: fm_token });

describe('fm_selector', () => {
  const valid_user = repo_impl.valid_user;
  const valid_conn = repo_impl.valid_conn;

  describe('#allocate validation', () => {
    beforeEach(() => {
      repo_impl.reset();
    });

    it('response to allocate', () => {
      expect(fm_selector).to.respondTo('allocate');
    });

    it('invalidate empty user parameter', () => {
      return fm_selector
        .allocate(null, null)
        .catch(err => { expect(err.message).to.have.string('bad user'); });
    });

    it('invalidate user parameter without user_id', () => {
      let invalid_user = { device_id: 'device_id' };
      return fm_selector
        .allocate(invalid_user, null)
        .catch(err => { expect(err.message).to.have.string('bad user id'); });
    });

    it('invalidate user parameter without device_id', () => {
      let invalid_user = { user_id: 'user_id' };
      return fm_selector
        .allocate(invalid_user, null)
        .catch(err => { expect(err.message).to.have.string('bad device id'); });
    });

    it('invalidate empty connection parameter', () => {
      return fm_selector
        .allocate(valid_user, null)
        .catch(err => { expect(err.message).to.have.string('bad connection'); });
    });

    it('invalidate connection parameter without ip', () => {
      let invalid_conn = {};
      return fm_selector
        .allocate(valid_user, invalid_conn)
        .catch(err => { expect(err.message).to.have.string('bad connection ip'); });
    });
  });

  describe('#allocate session', () => {
    beforeEach(() => {
      repo_impl.reset();
    });

    it('report error in case of repository failure', () => {
      repo_impl.mimic_db_failure();
      return fm_selector
        .allocate(valid_user, valid_conn)
        .catch(err => { expect(err.message).to.have.string('fail on accessing session storage'); });
    });

    it('allow one session per user/device/ip combo', () => {
      return fm_selector
        .allocate(valid_user, valid_conn)
        .then(result => {
          expect(result).to.exist;
          expect(result.fm_ip).to.exist;
          expect(result.token).to.exist;
        });
    });

    it('inactive session will be resued for repeated calls', () => {
      repo_impl.prepare_inactive_session();
      return fm_selector
        .allocate(valid_user, valid_conn)
        .then(result => {
          expect(result).to.exist;
          expect(result.fm_ip).to.exist;
          expect(result.token).to.exist;
        });
    });

    it('existing active session will fail subsequent calls', () => {
      repo_impl.prepare_active_session();
      return fm_selector
        .allocate(valid_user, valid_conn)
        .catch(err => { expect(err.message).to.have.string('active session found'); });
    });
  });
});
