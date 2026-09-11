const { GatewayIntentBits } = require('discord.js');
const config = require('./config.js');
const BotClient = require('./structures/Client.js');

const {
    GuildMembers,
    MessageContent,
    GuildMessages,
    Guilds,
    GuildMessageTyping,
    GuildVoiceStates,
} = GatewayIntentBits;

const clientOptions = {
    intents: [
        Guilds,
        GuildMessages,
        MessageContent,
        GuildMembers,
        GuildMessageTyping,
        GuildVoiceStates,
    ],
    allowedMentions: {
        parse: ['users', 'roles'],
        repliedUser: false,
    },
};

const client = new BotClient(clientOptions);
client.start(config.token);