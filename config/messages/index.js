const {
  commonAdminRegularMessage,
  commonCustomerRegularMessage,
} = require("./locale");

/**
 * Customer Message Template
 * @param { Partial<keyof typeof commonCustomerRegularMessage> } messageKey
 * @returns { string | (value: string) => string }
 */
function commonMessage(messageKey) {
  return commonCustomerRegularMessage[messageKey];
}

/**
 * Admin Message Template
 * @param { Partial<keyof typeof commonAdminRegularMessage> } messageKey
 * @returns { string | (value: string) => string }
 */
function moderationMessage(messageKey) {
  return commonAdminRegularMessage[messageKey];
}

module.exports = {
  commonMessage,
  moderationMessage,
};
