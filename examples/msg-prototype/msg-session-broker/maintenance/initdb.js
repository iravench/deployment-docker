'use strict';

import mysql from 'mysql'
import config from '../src/config'

const pool = mysql.createPool(config.storage.mysql);

const dropSessionTable = 'drop table if exists session;';
const createSessionTable = 'CREATE TABLE session (id MEDIUMINT NOT NULL AUTO_INCREMENT, user_id VARCHAR(30) NOT NULL, device_id VARCHAR(30) NOT NULL, ip VARCHAR(15) NOT NULL, status VARCHAR(10) NOT NULL, fm_id VARCHAR(10), socket_id VARCHAR(50), PRIMARY KEY (id));';

pool.getConnection((error, conn) => {
  conn.query(dropSessionTable, (err, results) => {
    if (err) console.log('error dropping table session', err);
  });
  conn.query(createSessionTable, (err, results) => {
    if (err) console.log('error creating table session', err);
  });

  conn.release();

  pool.end((err) => {
    if (err) console.log('error closing mysql pool', err);
  });
});

