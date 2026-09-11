const dotenv = require('dotenv');

dotenv.config();

module.exports = {
    token: process.env.TOKEN,
    prefix: process.env.PREFIX || '!',
    color: {
        red: 0xff0000,
        green: 0x00ff00,
        blue: 0x0000ff,
        yellow: 0xffff00,
        main: 0x2f3136,
    },
    // Render assigns its own PORT env var; the keep-alive server binds to it
    // so the service is reachable and won't be flagged as unhealthy.
    port: parseInt(process.env.PORT) || 3000,
    botStatus: process.env.BOT_STATUS || 'online', // online, idle, dnd, invisible
    botActivity: process.env.BOT_ACTIVITY || '24/7 and counting', // set the bot activity
    botActivityType: parseInt(process.env.BOT_ACTIVITY_TYPE || '2'), // 0 to 5, see https://discord.com/developers/docs/topics/gateway-events#activity-object-activity-types
    owners: JSON.parse(process.env.OWNER_IDS || '[]'),
    clientId: process.env.CLIENT_ID,
    guildId: process.env.GUILD_ID,
    logChannelId: process.env.LOG_CHANNEL_ID || '',
    // true = register slash commands globally (can take up to 1hr to propagate)
    // false = register instantly to GUILD_ID only, useful while developing
    production: parseBoolean(process.env.PRODUCTION) || true,
};
function parseBoolean(value) {
    if (typeof value === 'string') {
        value = value.trim().toLowerCase();
    }
    switch (value) {
        case 'true':
            return true;
        default:
            return false;
    }
}
