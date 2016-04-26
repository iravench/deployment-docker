'use strict';

import mysql from 'mysql'
import config from '../config'
import logger from '../utils/logger'
import { StorageError } from '../utils/errors'

const log = logger.child({module: 'repo_impl'});
//TBD should probably inject a pool instance so that we can do unit testing...
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
const selectFmRegistrationQuery = 'select A.fm_id, A.fm_ip, A.fm_port, IFNULL(B.live_session_count, 0) loads from fm_registration A left outer join (select fm_id, count(1) as live_session_count from session where status="active" group by fm_id) B on A.fm_id=B.fm_id;';

function handleMySQLError(reject, err, err_msg) {
  log.error(err);
  return reject(new StorageError(err_msg));
}

function mysqlPromise(handler) {
  let err_msg = 'error connecting to storage';

  return new Promise((resolve, reject) => {
    log.debug('getting pooled mysql connection');
    pool.getConnection((err, connection) => {
      if (err) return handleMySQLError(reject, err, err_msg);

      log.debug('mysql connection established');
      handler(connection, resolve, reject);
    });
  });
}

export default {
  get_none_closed_session(user, conn) {
    let err_msg = 'error querying storage for non-closed session data';

    return mysqlPromise((connection, resolve, reject) => {
      log.debug('querying non-closed session data');
      connection.query(selectNonClosedSessionQuery, [user.user_id, user.device_id, conn.ip], (err, rows) => {
        if (err) return handleMySQLError(reject, err, err_msg);

        if (rows.length > 0) {
          log.debug('non-closed session data of id %s retrieved', rows[0].id);
          resolve(rows[0]);
        }
        else {
          log.debug('non-closed session data not found');
          resolve(null);
        }

        connection.release();
      });
    });
  },
  create_new_session: function(user, conn) {
    let err_msg = 'error updating storage for setting new session data';

    return mysqlPromise((connection, resolve, reject) => {
      log.debug('setting new session data');
      connection.query(insertNewSessionQuery, [user.user_id, user.device_id, conn.ip], (err, result) => {
        if (err) return handleMySQLError(reject, err, err_msg);

        log.debug('new session data of id %s set', result.insertId);
        resolve({ id: result.insertId, status: "inactive" });

        connection.release();
      });
    });
  },
  get_fm_registrations: function() {
    let err_msg = 'error querying storage for front machine registration data';

    return mysqlPromise((connection, resolve, reject) => {
      log.debug('querying front machine registration data');
      connection.query(selectFmRegistrationQuery, (err, result) => {
        if (err) return handleMySQLError(reject, err, err_msg);

        if (result.length >= 0) {
          log.debug('front machine registration data retrieved');
          resolve(result);
        }
        else {
          log.debug('front machine registration data not found');
          resolve(null);
        }

        connection.release();
      });
    });
  }
}
