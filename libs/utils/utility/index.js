const {
  commands,
  categoryCommands,
  cmdModules,
  privateCmdModules,
} = require("@libs/constants/command");
const { watchFile, writeFileSync } = require("fs");
const logger = require("../logger");
const { GlobSync } = require("glob");
const path = require("path");

/**
 * **Utility**
 *
 * Performs managing changes and register CommandModule
 */
class Utility {
  constructor() {
    this.registerCommand();
  }

  /**
   * **Get All Command Module From Specified Directory**
   * @param { typeof __dirname } directory
   * @returns { { basename: string, file: string }[] }
   */
  getAllFiles(directory) {
    const pathFiles = new GlobSync(
      path.join(directory, "**", "*.js").replace(/\\/g, "/")
    ).found;
    const files = [];
    for (let file of pathFiles) {
      const basename = path.parse(file).name.toLowerCase();
      files.push({
        basename,
        file,
      });
    }
    return files;
  }

  /**
   * **Register Map<keys, CommandModule>**
   */
  registerCommand() {
    const files = this.getAllFiles(
      path.join(__dirname, "..", "..", "..", "commands")
    );
    for (let { basename, file } of files) {
      if (commands.get(basename)) {
        continue;
      } else if (!require(file).callback) {
        continue;
      } else {
        commands.set(basename, require(file));
        watchFile(file, () => {
          const dir = path.resolve(file);
          if (dir in require.cache) {
            delete require.cache[dir];
            commands.set(basename, require(file));
            logger.info(`Reloaded changes for: ${basename}`);
          }
        });
      }
    }

    for (const x of commands.keys()) {
      const command = commands.get(x);
      const {
        aliases: [cmdKeys],
        category,
        permission,
        typeArgs,
        expectedArgs,
        exampleArgs,
        description,
      } = command;
      if (!category) {
        continue;
      }
      if (!cmdModules[category]) {
        cmdModules[category] = [];
      }
      !cmdModules[category].includes(category) &&
        cmdModules[category].push({
          name: cmdKeys,
          category: category ? category : "no-category",
          strict: permission ? permission : "unset",
          typeArgs: typeArgs ? typeArgs : "-",
          expectedArgs: expectedArgs ? expectedArgs : "",
          exampleArgs: exampleArgs
            ? exampleArgs === "-"
              ? ""
              : exampleArgs
            : "",
          description: description ? description : "-",
        });
      privateCmdModules.add(cmdModules);
    }
    logger.info(`Loaded commands ${commands.size} of ${files.length}`);
  }
}

module.exports = {
  Utility,
};
