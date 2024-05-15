const { adminData } = require("@config/settings").metadata;

/**
 * @type { import('@libs/builders/command').ICommand }
 */
module.exports = {
  aliases: ["admin"],
  category: "customer",
  permission: "common",
  typeArgs: "none",
  expectedArgs: "none",
  exampleArgs: "-",
  description: `Mengirim kontak Admin untuk keperluan tertentu.`,
  callback: async ({ client, msg }) => {
    const adminContacts = adminData.map((data) => ({
      vcard:
        "BEGIN:VCARD\n" +
        "VERSION:3.0\n" +
        `FN:${data.name}\n` +
        `ORG:${data.position};\n` +
        `TEL;type=CELL;type=VOICE;waid=${data.phoneNumber}:+${data.phoneNumber}\n` +
        "END:VCARD",
    }));
    return client.sendMessage(msg.from, {
      contacts: {
        contacts: [...adminContacts],
      },
    });
  },
};
