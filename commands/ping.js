const { SlashCommandBuilder} = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('The bot ping!'),
  
	async execute(interaction) {
    await interaction.deferReply({ephemeral: true})
		await interaction.editReply({content:`Pong! The bot ping is ${interaction.client.ws.ping}ms`, ephemeral: true});
	},
};