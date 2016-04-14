'use strict';

import logger from './utils/logger'
import repo_impl from './implementations/repo_impl';
import repo_factory from './repo_factory';
import fm_selector_factory from './fm_selector_factory';
import { SessionAlreadyActivatedError } from './utils/errors'

const log = logger.child({widget_type: 'fm_auth'});

const repo = repo_factory({ impl: repo_impl });
const fm_selector = fm_selector_factory({ repo: repo });

export default {
  activate: (socket, decodedToken, onSuccess, onError) => {
    //TBD might want further compare socket client info with decoded token
    //to ensure this is in fact the client sending the token he properly obtained
    if (!socket.handshake.address.includes(decodedToken.conn.ip)) {
      let err_msg = 'client ip does not match with token';
      log.trace(err_msg);
      onError({ message: err_msg }, 'invalid_token');
    }

    // activate session base on the decoded token
    fm_selector.activate(decodedToken, socket.id).then((result) => {
      onSuccess();
    },
    (err) => {
      if (err instanceof SessionAlreadyActivatedError) {
        onError({ message: 'session has already been activated' }, 'invalid_token');
      } else {
        onError({ message: 'unknown error, please retry' });
      }
    });
  }
}
