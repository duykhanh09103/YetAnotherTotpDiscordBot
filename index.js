const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, Collection, EmbedBuilder, Routes, REST } = require('discord.js');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const axios = require('axios');

const { TOKEN: token, CLIENTID: clientid, MONGODB_URI: mongodburi } = process.env;

const rest = new REST({ version: '10' }).setToken(token);

let mongoClient = new MongoClient(mongodburi)

let db;
mongoClient.connect().then(() => {
  db = mongoClient.db();
  client.db = db;
  console.log("Connected to MongoDB");
});

const client = new Client({
  intents: [GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.MessageContent,
  GatewayIntentBits.GuildMembers,
  GatewayIntentBits.GuildVoiceStates,
  ],
  allowedMentions: {
    parse: ['users', 'roles']

  }
});

client.commands = new Collection();
client.messageCommands = new Collection();
client.messageAliases = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
const commands = []
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
    
  } else {
    console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
  }
}

//sync commands to discord
(async () => {
      try {
        console.log(`STARTUP: Syncing ${commands.length} command to discord`);
        const data = await rest.put(Routes.applicationCommands(clientid), { body: commands })
        console.log(`STARTUP: Synced ${data.length} commands to discord`);
        console.log(data)
      }
      catch (e) {
        console.error(e)
      }
    })();


const messageCommandsPath = path.join(__dirname, 'message_commands');
const messageCommandFiles = fs.readdirSync(messageCommandsPath).filter(file => file.endsWith('.js'));
for (const file of messageCommandFiles) {
  const filePath = path.join(messageCommandsPath, file);
  const command = require(filePath);
  if ('execute' in command) {
    client.messageCommands.set(command.name, command);
    if ('aliases' in command) {
      for (const alias of command.aliases) {
        client.messageAliases.set(alias, command.name);
      }
    }
  } else {
    console.log(`[WARNING] The message command at ${filePath} is missing a required "execute" property.`);
  }
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}




client.on('rateLimited', () => {
  process.kill(1);
});
client.on('error', (e) => {
  console.error(e)
});
client.on('debug', (e) => {
  console.debug(e)
});




client.login(token);