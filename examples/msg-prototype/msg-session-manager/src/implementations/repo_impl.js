'use strict';

import mysql from 'mysql'
import config from '../config'
import logger from '../utils/logger'
import { StorageError } from '../utils/errors'

const log = logger.child({module: 'repo_impl'});
//TBD should probably inject a pool instance here so that we can do unit testing...
const pool = mysql.createPool(config.storage.mysql);

const selectInactiveSessionQuery = 'select id from session where id=? and status="inactive"';
const activateSessionQuery = 'update session set status="active", fm_id=?, socket_id=? where id=?';
const closeSessionQuery = 'update session set status="closed" where socket_id=?';
const closeFmSessionsQuery = 'update session set status="closed" where fm_id=? and status!="closed"';
const selectFmRegistrationQuery = 'select fm_id as id from fm_registration where fm_id=?';
const insertNewFmRegistrationQuery = 'insert into fm_registration (fm_id, fm_ip, fm_port) values (?, ?, ?)';
const deleteFmRegistrationQuery = 'delete from fm_registration where fm_id=?';

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
  get_inactive_session(session_id) {
    let err_msg = 'error querying storage for inactive session data';

    return mysqlPromise((connection, resolve, reject) => {
      log.debug('querying inactive session data by id %s', session_id);
      connection.query(selectInactiveSessionQuery, [session_id], (err, result) => {
        if (err) return handleMySQLError(reject, err, err_msg);

        if (result.length >= 0) {
          log.debug('inactive session data by id %s retrieved', session_id);
          resolve(result[0]);
        }
        else {
          log.debug('inactive session data by id %s not found', session_id);
          resolve(null);
        }

        connection.release();
      });
    });
  },
  activate_session: function(session_id, fm_id, socket_id) {
    let err_msg = 'error updating storage for activating session data';

    return mysqlPromise((connection, resolve, reject) => {
      log.debug('updating session data by id %s to active', session_id);
      connection.query(activateSessionQuery, [fm_id, socket_id, session_id], (err, result) => {
        if (err) return handleMySQLError(reject, err, err_msg);

        log.debug('session data by id %s updated as active', session_id);
        resolve({ id: session_id });

        connection.release();
      });
    });
  },
  close_session: function(socket_id) {
    let err_msg = 'error updating storage for closing session data';

    return mysqlPromise((connection, resolve, reject) => {
      log.debug('updating session data by socket_id %s to closed', socket_id);
      connection.query(closeSessionQuery, [socket_id], (err, result) => {
        if (err) return handleMySQLError(reject, err, err_msg);

        log.debug('session data by socket_id %s updated as closed', socket_id);
        resolve();

        connection.release();
      });
    });
  },
  close_fm_sessions: function(fm_id) {
    let err_msg = 'error updating storage for closing front machine related session data';

    return mysqlPromise((connection, resolve, reject) => {
      log.debug('updating session data related to fm_id %s to closed', fm_id);
      connection.query(closeFmSessionsQuery, [fm_id], (err, result) => {
        if (err) return handleMySQLError(reject, err, err_msg);

        log.debug('session data related to fm_id %s updated as closed', fm_id);
        resolve();

        connection.release();
      });
    });
  },
  get_fm_registration: function(fm_id) {
    let err_msg = 'error querying storage for front machine registration data';

    return mysqlPromise((connection, resolve, reject) => {
      log.debug('querying front machine registration data by fm_id %s', fm_id);
      connection.query(selectFmRegistrationQuery, [fm_id], (err, result) => {
        if (err) return handleMySQLError(reject, err, err_msg);

        if (result.length > 0) {
          log.debug('front machine registration data by fm_id %s retrieved', fm_id);
          resolve(result[0]);
        }
        else {
          log.debug('front machine registration data by fm_id %s not found', fm_id);
          resolve(null);
        }

        connection.release();
      });
    });
  },
  set_fm_registration: function(fm_id, fm_ip, fm_port) {
    let err_msg = 'error updating storage for setting front machine registration data';

    return mysqlPromise((connection, resolve, reject) => {
      log.debug('setting front machine registration data of fm_id %s', fm_id);
      connection.query(insertNewFmRegistrationQuery, [fm_id, fm_ip, fm_port], (err, result) => {
        if (err) return handleMySQLError(reject, err, err_msg);

        log.debug('front machine registration data of fm_id %s set', fm_id);
        resolve();

        connection.release();
      });
    });
  },
  delete_fm_registration: function(fm_id) {
    let err_msg = 'error updating storage for deleting front machine registration data';

    return mysqlPromise((connection, resolve, reject) => {
      log.debug('deleting front machine registration data of fm_id %s', fm_id);
      connection.query(deleteFmRegistrationQuery, [fm_id], (err, result) => {
        if (err) return handleMySQLError(reject, err, err_msg);

        log.debug('front machine registration data of fm_id %s deleted', fm_id);
        resolve();

        connection.release();
      });
    });
  }
}
