/**
 * @type { Map<string, import("@libs/builders/command").CommandModule> }
 */
const commands = new Map();

/**
 * @type { { [category: string]: string[] } }
 */
const listCommands = {};

/**
 * @type { { [category: string]: string[] } }
 */
const categoryCommands = {};

/**
 * @types { { [category: string]: { name: string; category: string; strict: "admin" | "common"; description: string | null }[] } }
 * @type { import("./types").CommandModules }
 */
const cmdModules = {};

/**
 * @type { Set<import("./types").PrivateModules> }
 */
const privateCmdModules = new Set();

module.exports = {
  commands,
  listCommands,
  categoryCommands,
  cmdModules,
  privateCmdModules,
};
//
