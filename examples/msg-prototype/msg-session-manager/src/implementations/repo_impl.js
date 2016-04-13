'use strict';

import mysql from 'mysql'
import config from '../config'
import logger from '../utils/logger'
import { StorageError } from '../utils/errors'

const log = logger.child({widget_type: 'repo_impl'});
//TBD should probably inject a pool instance here so that we can do unit testing...
const pool = mysql.createPool(config.storage.mysql);

const selectInactiveSessionQuery = 'select id from session where id=? and status="inactive"';

const activateSessionQuery = 'update session set status="active", fm_id=?, socket_id=? where id=?';

export default {
  get_inactive_session(session_id) {
    return new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          let err_msg = 'error connecting mysql';
          log.trace(err, err_msg);
          return reject(new StorageError(err_msg));
        }

        connection.query(selectInactiveSessionQuery, [session_id], (err, result) => {
          if (err) {
            console.log(err);
            let err_msg = 'error querying mysql session';
            log.trace(err, err_msg);
            return reject(new StorageError(err_msg));
          }

          if (result.length >= 0)
            resolve(result[0]);
          else
            resolve(null);

          connection.release();
        });
      });
    });
  },
  activate_session: function(session_id, fm_id, socket_id) {
    return new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          let err_msg = 'error connecting mysql';
          log.trace(err, err_msg);
          return reject(new StorageError(err_msg));
        }

        connection.query(activateSessionQuery, [fm_id, socket_id, session_id], (err, result) => {
          if (err) {
            let err_msg = 'error updating mysql session';
            log.trace(err, err_msg);
            return reject(new StorageError(err_msg));
          }

          resolve({ id: session_id });
          connection.release();
        });
      });
    });
  }
}
