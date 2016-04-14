'use strict';

import logger from './utils/logger'
import repo_impl from './implementations/repo_impl';
import repo_factory from './repo_factory';
import fm_session_factory from './fm_session_factory';
import { SessionAlreadyActivatedError } from './utils/errors'

const log = logger.child({widget_type: 'fm_auth'});

const repo = repo_factory({ impl: repo_impl });
const fm_session = fm_session_factory({ repo: repo });

export default {
  auth: (socket, decodedToken, onSuccess, onError) => {
    //TBD might want further compare socket client info with decoded token
    //to ensure this is in fact the client sending the token he properly obtained
    if (!socket.handshake.address.includes(decodedToken.conn.ip)) {
      let err_msg = 'client ip does not match with token';
      log.trace(err_msg);
      onError({ message: err_msg }, 'invalid_token');
    }

    // activate session base on the decoded token
    fm_session.activate(decodedToken, socket.id).then((result) => {
      onSuccess();
    },
    (err) => {
      if (err instanceof SessionAlreadyActivatedError) {
        let err_msg = 'session has already been activated';
        log.trace(err, err_msg);
        onError({ message: err_msg }, 'invalid_token');
      } else {
        let err_msg = 'unknown error, please retry';
        log.trace(err, err_msg);
        onError({ message: err_msg });
      }
    });
  },
  close: (socket_id) => {
    return fm_session.deactivate(socket_id).then(() => {
      log.trace('socket session deactivated');
    },
    (err) => {
      let err_msg = 'error deactivating socket session';
      log.trace(err, err_msg);
    });
  }
}
