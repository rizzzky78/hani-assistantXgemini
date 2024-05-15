/**
 * **Data Converter**
 *
 * Performs:
 * - `bufferToBase64Converter(Buffer): base64`
 * - `base64ToBufferConverter(base64): Buffer`
 */
class Converter {
  /**
   * Buffer >> Base64
   * @param { Buffer } buffer
   * @returns { Promise<string> }
   */
  static async bufferToBase64Converter(buffer) {
    return `data:image/jpeg;base64,${buffer.toString("base64")}`;
  }
  /**
   * Base64 >> Buffer
   * @param { string } base64
   * @returns { Promise<Buffer> }
   */
  static async base64ToBufferConverter(base64) {
    return Buffer.from(
      base64.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );
  }
}

module.exports = Converter;
