const config = require('./config.js');
const Logger = require('./structures/Logger.js');

const logger = new Logger();

console.log(
    '\x1b[35m%s\x1b[0m',
    [
        '  ___ _  _  ___ _____',
        ' |_  ) || |/ _ \\___  |',
        '  / /| || | (_) | / /',
        ' /___|__,_|\\___/ /_/ ',
        '',
        ' Always-on Discord bot',
    ].join('\n')
);

if (!config.token) {
    logger.error(
        'No TOKEN set. Add TOKEN to your .env file (locally) or your Render service\'s environment variables.'
    );
    process.exit(1);
}

// This is a small, single-process bot, so it runs directly rather than
// through discord.js's ShardingManager. Sharding only becomes necessary
// around ~2,500 guilds, and multiple shard processes would otherwise
// fight over Render's single PORT for the keep-alive server.
require('./client.js');
