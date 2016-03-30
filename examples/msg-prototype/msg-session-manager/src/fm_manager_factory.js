'use strict';

export default function(config) {
  const { repo, token } = config;

  return {
    validate: function(user, conn, ticket) {
      return new Promise((resolve, reject) => {
        // a ticket, if not revoked, could be lasting through out sessions
        // then a session's status could be either activated or closed
        // manage api should provide an interface to close a specific ticket then
        //
        // 1. validate ticket(repo session read, there could be multiple session repos, base on fmip for example)
        // 2. check if ws conn exist
        // 3. if not, init new ws conn
        // 4. if already exist, skip
        resolve({ack: 'ok'});
      });
    }
  };
}
