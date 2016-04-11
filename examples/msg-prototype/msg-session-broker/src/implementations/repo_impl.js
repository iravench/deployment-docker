'use strict';

import mysql from 'mysql'
import config from '../config'
import logger from '../utils/logger'
import { StorageError } from '../utils/errors'

const log = logger.child({widget_type: 'repo_impl'});
//TBD should probably inject a pool instance here so that we can do unit testing...
const pool = mysql.createPool(config.storage.mysql);

// how can we store this data in redis?
//
// how does the session data look like?
// there should always be only one non-closed user_id:device_id:ip combination, could be a key
//
// if the key is not exist, create a new one with status equals to inactive
// status later changes from inactive to active to finally closed
// when user request a new session, always create/update that key's status to inactive
// if the status is active, also signal manager to close ws socket
// so fm_id, socket_id should also be stored, (io.Namespace#connected[socket_id])
//
// when the session gets created, we need to look up the key, check its status,
// if the session not exist, create one with the status equals to inactive
// if the status is inactive, we're done
// if the status is closed, we need to update it to inactive
// if the status is active, we need to update it to inactive and notify manager to close ws socket
//
// when the session gets activated - only when session status equals to inactive
// we need to update session from inactive to active, also fill in fm_id and socket_id
// we need to increase fm_id's socket count to advise policy component
// we need to update a user_id list with a fm_id/socket_id combonations for sending serverside messages
//
// when the session gets closed
// we need to update session from active to inactive, also remove fm_id and socket_id
// we need to decrease fm_id's socket count to advise policy component
// when close by ws connectivity, we need to update a user_id list to remove the 
// when close by session allocation
// when fm crash? the whole fm_id related session should be reset
//
// so MYSQL is a better option here, not redis

const selectNonClosedSessionQuery = 'select id, status from session where user_id=? and device_id=? and ip=? and status!="closed"';

const insertNewSessionQuery = 'insert into session (user_id, device_id, ip, status) values (?, ?, ?, "inactive")';

export default {
  get_none_closed_session(user, conn) {
    return new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          let err_msg = 'error accessing storage';
          log.trace(err, err_msg);
          return reject(new StorageError(err_msg));
        }

        connection.query(selectNonClosedSessionQuery, [user.user_id, user.device_id, conn.ip], (err, rows) => {
          if (err) {
            let err_msg = 'error querying session storage';
            log.trace(err, err_msg);
            return reject(new StorageError(err_msg));
          }

          if (rows.length >= 0)
            resolve(rows[0]);
          else
            resolve(null);

          connection.release();
        });
      });
    });
  },
  create_new_session: function(user, conn) {
    return new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          let err_msg = 'error accessing storage';
          log.trace(err, err_msg);
          return reject(new StorageError(err_msg));
        }

        connection.query(insertNewSessionQuery, [user.user_id, user.device_id, conn.ip], (err, result) => {
          if (err) {
            let err_msg = 'error inserting new session to storage';
            log.trace(err, err_msg);
            return reject(new StorageError(err_msg));
          }

          resolve({ id: result.insertId, status: "inactive" });
          connection.release();
        });
      });
    });
  }
}
