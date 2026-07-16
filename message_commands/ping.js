
module.exports = {

    name: 'ping',
    aliases:['pong'],

	async execute(message) {
		await message.reply({content:`Pong! The bot ping is ${message.client.ws.ping}ms`, ephemeral: true});
	},
};