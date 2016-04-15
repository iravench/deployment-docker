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
const closeSessionQuery = 'update session set status="closed" where socket_id=?';
const closeFmSessionsQuery = 'update session set status="closed" where fm_id=? and status!="closed"';
const selectFmRegistrationQuery = 'select fm_id as id from fm_registration where fm_id=?';
const insertNewFmRegistrationQuery = 'insert into fm_registration (fm_id, fm_ip) values (?, ?)';
const deleteFmRegistrationQuery = 'delete from fm_registration where fm_id=?';

function mysqlPromise(handler) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        let err_msg = 'error connecting mysql';
        log.trace(err, err_msg);
        return reject(new StorageError(err_msg));
      }

      handler(connection, resolve, reject);
    });
  });
}

export default {
  get_inactive_session(session_id) {
    return mysqlPromise((connection, resolve, reject) => {
      connection.query(selectInactiveSessionQuery, [session_id], (err, result) => {
        if (err) {
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
  },
  activate_session: function(session_id, fm_id, socket_id) {
    return mysqlPromise((connection, resolve, reject) => {
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
  },
  close_session: function(socket_id) {
    return mysqlPromise((connection, resolve, reject) => {
      connection.query(closeSessionQuery, [socket_id], (err, result) => {
        if (err) {
          let err_msg = 'error closing mysql session';
          log.trace(err, err_msg);
          return reject(new StorageError(err_msg));
        }

        resolve();
        connection.release();
      });
    });
  },
  close_fm_sessions: function(fm_id) {
    return mysqlPromise((connection, resolve, reject) => {
      connection.query(closeFmSessionsQuery, [fm_id], (err, result) => {
        if (err) {
          let err_msg = 'error closing fm related sessions';
          log.trace(err, err_msg);
          return reject(new StorageError(err_msg));
        }

        resolve();
        connection.release();
      });
    });
  },
  get_fm_registration: function(fm_id) {
    return mysqlPromise((connection, resolve, reject) => {
      connection.query(selectFmRegistrationQuery, [fm_id], (err, result) => {
        if (err) {
          let err_msg = 'error querying mysql fm registration';
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
  },
  set_fm_registration: function(fm_id, fm_ip) {
    return mysqlPromise((connection, resolve, reject) => {
      connection.query(insertNewFmRegistrationQuery, [fm_id, fm_ip], (err, result) => {
        if (err) {
          let err_msg = 'error inserting new fm registration to storage';
          log.trace(err, err_msg);
          return reject(new StorageError(err_msg));
        }

        resolve();
        connection.release();
      });
    });
  },
  delete_fm_registration: function(fm_id) {
    return mysqlPromise((connection, resolve, reject) => {
      connection.query(deleteFmRegistrationQuery, [fm_id], (err, result) => {
        if (err) {
          let err_msg = 'error deleting fm registration to storage';
          log.trace(err, err_msg);
          return reject(new StorageError(err_msg));
        }

        resolve();
        connection.release();
      });
    });
  }
}
