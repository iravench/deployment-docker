'use strict';

import logger from './utils/logger'
import { SessionInUseError } from './utils/errors'

const log = logger.child({module: 'auth_factory'});

export default function(opts) {
  const { fm_session } = opts;

  return {
    auth: (socket, decodedToken, onSuccess, onError) => {
      //TBD might want further compare socket client info with decoded token
      //to ensure this is in fact the client sending the token he properly obtained
      log.debug('verifying jwt content');
      if (!socket.handshake.address.includes(decodedToken.conn.ip)) {
        let err_msg = 'client ip does not match with jwt content';
        log.warn(err_msg);
        return onError({ message: err_msg }, 'invalid_token');
      }

      log.debug('activating session base on decoded jwt');
      fm_session.activate(decodedToken, socket.id).then((result) => {
        log.debug('session activated, jwt auth is successful');
        return onSuccess();
      },
      (err) => {
        if (err instanceof SessionInUseError) {
          log.warn(err);
          let err_msg = 'session has already been activated';
          onError({ message: err_msg }, 'invalid_token');
        } else {
          log.error(err);
          let err_msg = 'unknown error, please retry';
          onError({ message: err_msg });
        }
      });
    },
    close: (socket_id) => {
      log.debug('deactivating socket session by socket_id %s', socket_id);
      return fm_session.deactivate(socket_id).then(() => {
        log.debug('socket session by socket_id %s deactivated', socket_id);
      },
      (err) => {
        log.error(err);
      });
    }
  };
}
