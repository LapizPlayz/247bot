const Command = require("../../structures/Command.js");
const { getVoiceConnection } = require("@discordjs/voice");

module.exports = class Status extends Command {
  constructor(client) {
    super(client, {
      name: "status",
      description: {
        content: "Checks the current voice connection status",
        examples: ["status"],
        usage: "status",
      },
      category: "voice",
      aliases: ["vcstatus", "vstatus"],
      cooldown: 3,
      args: false,
      permissions: {
        dev: false,
        client: ["SendMessages", "ViewChannel", "EmbedLinks"],
        user: [],
      },
      slashCommand: true,
      options: [],
    });
  }

  async run(client, ctx) {
    const connection = getVoiceConnection(ctx.guild.id);

    if (!connection) {
      return ctx.sendMessage({
        content: "Status: **Offline / Not in Voice**",
        ephemeral: true,
      });
    }

    const channelId = connection.joinConfig.channelId;
    return ctx.sendMessage({
      content: `Status: **Connected** to voice channel <#${channelId}>.`,
      ephemeral: true,
    });
  }
};
