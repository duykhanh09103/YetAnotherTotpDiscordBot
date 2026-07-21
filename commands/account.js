const { SlashCommandBuilder } = require('discord.js');
const { v4: uuidv4 } = require('uuid');
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
                    option.setName('name')
                        .setDescription('The Account\'s name')
                        .setAutocomplete(true)
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
        const digit = interaction.options.getNumber("digit") || "6";
        //explain: name is id becuz the auto complete will return id, this will give user better understanding of their account
        const name = interaction.options.getString("name");
        if (action === 'add') {
            const newId = uuidv4()
            const user = await iteraction.client.db.collection('user').findOne({ id: interaction.user.id });
            const newAccount = await interaction.client.db.collection("account").insertOne({
                id: newId,
                owner: {
                    id: interaction.user.id,
                    name: interaction.user.name
                },
                trusteduser: [interaction.user.id],
                username: username,
                platform: platform,
                secret: secret,
                digit: digit
            });
            if (!user) {
                await interaction.client.db.collection("user").insertOne({
                    id: interaction.user.id,
                    username: interaction.user.name,
                    allowlist: [newId],
                })
            }
            await interaction.client.db.collection("user").updateOne({ id: interaction.user.id }, {
                $push: {
                    "allowlist": newId
                }
            });
            //add message here later
        };

        if (action === "remove") {

            try {
                const account = await interaction.client.db.collection("account").findOne({ id: name, trusteduser: interaction.user.id });
                if (interaction.user.id !== account.owner.id) { return; } //add message here later
                const user = await interaction.client.db.collection("user").findOneAndUpdate({ id: interaction.user.id }, {
                    $pull: {
                        "allowlist": account.id
                    }
                })
                await interaction.client.db.collection("account").findOneAndDelete({ id: account.id })
                //add message here ig
            }
            catch (e) {
                console.log(e)
                //add message for error here
            }


        }

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