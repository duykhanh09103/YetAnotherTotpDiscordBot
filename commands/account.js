const { SlashCommandBuilder } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('account')
        .setDescription('Add/Remove account to the bot')
        .addSubcommand(subcommand =>
            subcommand.setName("add")
                .setDescription("Add account to the bot")
                .addStringOption(option =>
                    option.setName('username')
                        .setDescription('Account\'s user name')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('platform')
                        .setDescription('Which platform is account is on (eg Riot Game,...)')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('secret')
                        .setDescription('Account totp serect')
                        .setRequired(true)
                )
                .addNumberOption(option =>
                    option.setName('digit')
                        .setDescription('How many digit are there in the code (default to 6)')
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand.setName("remove")
                .setDescription("remove your account from the bot")
                .addStringOption(option =>
                    option.setName('id')
                        .setDescription('The Account\'s id')
                        .setRequired(true)
                )
        )
    ,

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const action = interaction.options.getSubcommand();
        const username = interaction.options.getString("username");
        const platform = interaction.options.getString("platform");
        const secret = interaction.options.getString("secret");
        const digit = interaction.options.getNumber("digit");
        const accoundId = interaction.options.getString("id");

        if (action === 'add') {
            const user = await iteraction.client.db.collection('user').findOne({ id: interaction.user.id })
            await interaction.client.db.collection("account").insertOne({
                owner: {
                    id: interaction.user.id,
                    name: interaction.user.name
                },
                name: username,
                platform: platform,
                secret: secret,
                digit: digit
            })
            if (!user) {
             await interaction.client.db.collection("user").insertOne({
                  id:interaction.user.id,
                  username:interaction.user.name,
                  allowlist:[],

             })
            }
        }

    },
};