const { performance } = require("perf_hooks");

/**
 * @type { import('@libs/builders/command').ICommand }
 */
module.exports = {
  aliases: ["test"],
  waitMessage: true,
  callback: async ({ client, msg }) => {
    performance.mark("start-test");
    const start = Date.now();
    msg.reply(`Indeed this is a test!\n> start time: ${start}`).then(() => {
      performance.mark("end-test");
      performance.measure("testing", "start-test", "end-test");
      const measure = performance.getEntriesByName("testing");
      client.sendMessage(msg.from, {
        text: `> Elapsed Time:\n${JSON.stringify(measure, null, 2)}`,
      });
      performance.clearMarks();
      performance.clearMeasures();
      return;
    });
  },
};
