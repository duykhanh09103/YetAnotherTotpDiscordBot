const { SlashCommandBuilder} = require('discord.js');
const OTPAuth = require("otpauth");
module.exports = {
	data: new SlashCommandBuilder()
		.setName('get')
		.setDescription('get otp for your account')
		.addStringOption(option =>
                    option.setName('name')
                        .setDescription('Your acount\'s name')
                        .setAutocomplete(true)
						.setRequired(true)
                )
		,
  
	async execute(interaction) {
    await interaction.deferReply({ephemeral: true})
	//explain: bcuz the auto complete will return id, set the option as name will give user better understanding of their account
	const id = interaction.options.getString("name");
    const account = await interaction.client.db.collection("account").findOne({ id: id,trusteduser:interaction.user.id });
    const otp = new OTPAuth.TOTP({secret:account.secret,digits:account.digit});
	//send message here

	},
	async autocomplete(interaction) {
        const allAccounts = []
        const focusedValue = interaction.options.getFocused();
        const accounts = await interaction.client.db.collection("account").find({ trusteduser: interaction.user.id }).toArray();
        accounts.forEach(account => {
            allAccounts.push({ name: (account.username + "-" + account.platform).replace(" ", ""), id: account.id });
        });
        const filtered = allAccounts.filter((choice) => choice.name.includes(focusedValue));
        await interaction.respond(filtered.map((choice) => ({ name: choice.name, value: choice.id })));
    },
};