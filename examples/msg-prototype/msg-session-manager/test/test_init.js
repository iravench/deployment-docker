'use strict';

import chai from 'chai';
import chaiImmutable from 'chai-immutable';
import sinonChai from 'sinon-chai';

chai.use(chaiImmutable);
chai.use(sinonChai);
process.env.NODE_ENV = 'test';
