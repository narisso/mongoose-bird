'use strict';

var Promise = require("bluebird");

/**
 * Call blubird's Promise.promisifyAll for static/instance functions of mongoose
 * model and query.
 *
 * @param {mongoose.Mongoose} [mongoose]
 * @returns {mongoose.Mongoose} the same mongoose instance, for convenince
 */
function promisify(mongoose, options) {
  mongoose = mongoose || require('mongoose');
  // avoid duplicated application for custom mapper function...
  var applied = require('crypto').createHash('md5').digest('hex');
  if (mongoose['__q_applied_' + applied]) {
    return mongoose;
  }

  Promise.promisifyAll(mongoose.Model);
  Promise.promisifyAll(mongoose.Model.prototype);
  Promise.promisifyAll(mongoose.Query.prototype);

  mongoose['__q_applied_' + applied] = true;
  return mongoose;
}

module.exports = promisify;
