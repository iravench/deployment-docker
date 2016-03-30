'use strict';

import { expect } from 'chai';

import repo_impl from './fixture/session_repo_impl';
import fm_token from '../src/fm_token';
import repo_factory from '../src/session_repo_factory';
import fm_session_manager_factory from './fm_session_manager_factory';

const repo = repo_factory({ impl: repo_impl });
const fm_session_manager = fm_session_manager_factory({ repo: repo, token: fm_token });

describe('fm_session_manager', () => {
  const valid_user = repo_impl.valid_user;
  const valid_conn = repo_impl.valid_conn;
  const valid_ticket = repo_impl.valid_ticket;

  describe('#activate validation', () => {
    beforeEach(() => {
      repo_impl.reset();
    });

    it('response to activate', () => {
      expect(fm_session_manager).to.respondTo('activate');
    });

    it('invalidate empty user parameter', () => {
      return fm_session_manager
        .allocate(null, null, null)
        .catch(err => { expect(err.message).to.have.string('bad user'); });
    });
  });
});
