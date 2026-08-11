const crypto = require('crypto');

/**
 * Generate a secure random token (64 hex characters).
 * @returns {string}
 */
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

module.exports = { generateToken };
