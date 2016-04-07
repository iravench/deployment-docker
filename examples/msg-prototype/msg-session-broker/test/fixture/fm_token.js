'use strict';

const valid_user = { user_id: 'user_id', device_id: 'device_id' };
const valid_conn = { ip: '192.168.1.111' };
const fm  = { id: 'fm-1', ip: '111.111.111.111' };
const session_id = 1;
const token = 'some fake token string';

export default {
  payload: { fm: fm, user: valid_user, conn: valid_conn, session_id: session_id },
  token: token
}
