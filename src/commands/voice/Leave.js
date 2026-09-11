const Command = require("../../structures/Command.js");
const { getVoiceConnection } = require("@discordjs/voice");

module.exports = class Leave extends Command {
  constructor(client) {
    super(client, {
      name: "leave",
      description: {
        content: "Disconnects the bot from the current voice channel",
        examples: ["leave"],
        usage: "leave",
      },
      category: "voice",
      aliases: ["disconnect", "dc"],
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
        content:
          "The bot is not currently connected to any voice channel in this server.",
        ephemeral: true,
      });
    }

    connection.destroy();
    return ctx.sendMessage("Disconnected from the voice channel.");
  }
};
