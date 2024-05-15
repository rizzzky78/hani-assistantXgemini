/**
 * **Class Random ID Generator**
 *
 * Performs:
 * - `generateTransactionId()`
 * - `generateCustomerId()`
 * - `generateOrderId()`
 * - `generateProductId()`
 */
class IDGenerator {
  static cryptoRandomString = require("crypto-random-string");
  /**
   * Randomly generates a transaction ID
   * @returns { string } Transaction ID
   */
  static generateTransactionId() {
    return "TRX-ID" + "-" + this.cryptoRandomString(7).toUpperCase();
  }

  /**
   * Randomly generates a customer ID
   * @returns { string } Customer ID
   */
  static generateCustomerId() {
    return "CUST-ID" + "-" + this.cryptoRandomString(10).toUpperCase();
  }

  /**
   * Randomly generates a unique order ID (UPPERCASE)
   * @returns { string } Order ID
   */
  static generateOrderId() {
    return "ORD-ID" + "-" + this.cryptoRandomString(8).toUpperCase();
  }

  /**
   * Randomly generates a unique order ID (UPPERCASE)
   * @returns { string } Product ID
   */
  static generateProductId() {
    return this.cryptoRandomString(6).toUpperCase();
  }

  static generateInvoiceId() {
    return "INV" + "-" + this.cryptoRandomString(10).toUpperCase();
  }

  static generateKeyImages() {
    return "IMG" + "-" + this.cryptoRandomString(12).toUpperCase();
  }

  /**
   *
   * @param { number | null } length
   */
  static generateRandom(length = null) {
    return this.cryptoRandomString(length ? length : 5);
  }
}

module.exports = IDGenerator;
