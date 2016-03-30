'use strict';

import { expect } from 'chai';
import repo_impl from './fixture/repo_impl';
import fm_token from '../src/fm_token';
import fm_policy from '../src/fm_policy';
import repo_factory from '../src/repo_factory';
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

    it('invalidate empty user', () => {
      return fm_selector
        .allocate(null, null)
        .catch(err => { expect(err.message).to.have.string('bad user'); });
    });

    it('invalidate user without user_id', () => {
      let invalid_user = { device_id: 'device_id' };
      return fm_selector
        .allocate(invalid_user, null)
        .catch(err => { expect(err.message).to.have.string('bad user id'); });
    });

    it('invalidate user without device_id', () => {
      let invalid_user = { user_id: 'user_id' };
      return fm_selector
        .allocate(invalid_user, null)
        .catch(err => { expect(err.message).to.have.string('bad device id'); });
    });

    it('invalidate empty connection', () => {
      return fm_selector
        .allocate(valid_user, null)
        .catch(err => { expect(err.message).to.have.string('bad connection'); });
    });

    it('invalidate connection without ip', () => {
      let invalid_conn = {};
      return fm_selector
        .allocate(valid_user, invalid_conn)
        .catch(err => { expect(err.message).to.have.string('bad connection ip'); });
    });
  });

  describe('#allocate ticket', () => {
    beforeEach(() => {
      repo_impl.reset();
    });

    it('error out in case of repository failure', () => {
      repo_impl.mimic_db_failure();
      return fm_selector
        .allocate(valid_user, valid_conn)
        .catch(err => { expect(err.message).to.have.string('fail on accessing session state'); });
    });

    it('one session per one user/device/ip combo', () => {
      return fm_selector
        .allocate(valid_user, valid_conn)
        .then(result => {
          expect(result).to.exist;
          expect(result.token).to.exist;
        });
    });

    it('inactive session gets resued', () => {
      repo_impl.prepare_inactive_session();
      return fm_selector
        .allocate(valid_user, valid_conn)
        .then(result => {
          expect(result).to.exist;
          expect(result.token).to.exist;
        });
    });

    it('active session fails subsequent requests', () => {
      repo_impl.prepare_active_session();
      return fm_selector
        .allocate(valid_user, valid_conn)
        .catch(err => { expect(err.message).to.have.string('active session found'); });
    });
  });
});
