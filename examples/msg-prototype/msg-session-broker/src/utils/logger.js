'use strict';

import bunyan from 'bunyan';
import config from '../config';

let _logger;
(function() {
  if (_logger) return;
  _logger = bunyan.createLogger(config.logger);
})();

export default _logger;
