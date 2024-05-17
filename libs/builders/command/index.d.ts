import { WAMessage, WASocket } from "@adiwajshing/baileys";
import { Serialize } from "@libs/utils/serialize";

interface CommandObject {
  client: WASocket;
  message: WAMessage;
  command: string;
  prefix: string;
  args: string[];
  fullArgs: string;
  msg: Serialize;
}

/**
 * **Command Builder**
 * @description Class command builder
 */
export class ICommand {
  /**
   * @description Command alias
   * @example aliases: ['blabla', 'blabla']
   */
  aliases?: string[];

  /**
   * @required
   * @description Command category (will use to build help command)
   * @example category: 'downloader'
   */
  category: "admin" | "customer" | "forms";

  /**
   * @required
   * @description Command description
   * @example description: 'Something Downloader'
   */
  description: string;

  /**
   * @description Command permission
   */
  permission?: "admin" | "common";

  /**
   * @description If true and not group and not admin will send forbidden message
   * @example adminOnly: true
   */
  adminOnly?: boolean;

  /**
   * @description If true and not group will send forbidden message
   * @example groupOnly: true
   */
  groupOnly?: boolean;

  /**
   * @description If true and not private will send forbidden message
   * @example privateOnly: true
   */
  privateOnly?: boolean;

  /**
   * @description Minimum argument, for example command without args will send required minimun args message
   * @example minArgs: 1
   */
  minArgs?: number;

  /**
   * @description Expected argument
   * @example expectedArgs: '<link1> <link2>'
   */
  expectedArgs?:
    | "<ORD-ID-XXX>"
    | "<TRX-ID-XXX>"
    | "<ORD-ID-XXX VIA>"
    | "<INV-ID-XXX>"
    | "<QUERY # QTY>"
    | "<QUERY>"
    | "<QUERY FORMS>"
    | "none";

  typeArgs?: "query" | "forms" | "none";

  /**
   * @description Example use of the command
   * @example example: '{prefix}{command} [args]'
   */
  exampleArgs?: string;

  /**
   * @description Send waiting message before execute the callback function
   * @example waitMessage: true
   */
  waitMessage?: boolean | string;

  /**
   * @description Cooldown command
   * @example cooldown: 10 * 1000 // 10 seconds
   */
  cooldown?: number;

  /**
   * **Callback Async Function**
   * @required
   * @description Callback to execute command function
   * @example callback: async ({ msg }) => await msg.reply('Hello World!')
   */
  callback: (obj: CommandObject) => Promise<AwaitableMediaMessage>;
}

/**
 * Wrap the CMD module
 */
interface CommandModule extends ICommand {}

/**
 * Typeof promises as pass to baileys WA Socket
 */
interface AwaitableMediaMessage extends VoidFunction {}
