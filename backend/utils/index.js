/**
 * Basic sanitization function to prevent XSS
 * @param {string} message - The message to sanitize
 * @returns {string} - Sanitized message
 */
function sanitizeMessage(message) {
  return message
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

module.exports = {
  sanitizeMessage,
};
