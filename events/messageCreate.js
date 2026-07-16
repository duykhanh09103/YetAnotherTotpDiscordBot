const { ChannelType } = require('discord.js');
require('dotenv').config();

const { PREFIX: prefix } = process.env;

module.exports = {
  name: 'messageCreate',
  async execute(message) {
    if (message.author.bot) return;
    if (message.channel.type === ChannelType.DM) return;
    if (!message.content.toLowerCase().startsWith(prefix)) return handleAutoResponse(message);
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    if (commandName.length === 0) return;
    let command = message.client.messageCommands.get(commandName);
    if (!command) {
      const aliasCommandName = message.client.messageAliases.get(commandName);
      if (aliasCommandName) {
        command = message.client.messageCommands.get(aliasCommandName);
      }
    }
    if (!command) {
      console.error(`No command matching ${commandName} was found.`);
      return;
    }
    try {
      await command.execute(message, args);
    } catch (error) {
      console.error(`Error executing ${commandName}`);
      console.error(error);
    }

    async function handleAutoResponse(message) {
      const linkArray = await message.client.db.collection('link').find({}).toArray();
      const linkname = linkArray.map(link => link.name);
      const link = linkname.find(name => message.content.toLowerCase().includes(name.toLowerCase()));
      if (link) {
        const response = await message.client.db.collection('link').findOne({ name: link });
        if (response) {
          await message.reply({ content: response.link.replace(/\\n/g,"\n"), allowedMentions: { repliedUser: false } });
        }
      }
      return;
    }
  },
}; 