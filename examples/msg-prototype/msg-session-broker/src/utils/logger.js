'use strict';

import bunyan from 'bunyan';
import config from '../config';

let level = config.debug ? "debug" : "info";

// mute log outputs for running tests
if (config.env == 'test') level = "fatal";

//TBD should be further customized based on running environment
let opts = {
  name: config.applicationName,
  level: level
};

export default bunyan.createLogger(opts);
