export type Images = {
  /**
   * Keypair of each images
   *
   * This is the key to access data
   */
  key: string;
  /**
   * Time sampt for image created at
   */
  timeStamp: string;
  /**
   * The Base64 image data
   */
  base64: string;
};
