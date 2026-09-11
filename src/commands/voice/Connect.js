const Command = require("../../structures/Command.js");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  VoiceConnectionStatus,
  entersState,
  getVoiceConnection,
} = require("@discordjs/voice");
const { Readable } = require("stream");

class SilenceStream extends Readable {
  _read(size) {
    this.push(Buffer.alloc(size));
  }
}

module.exports = class Connect extends Command {
  constructor(client) {
    super(client, {
      name: "connect",
      description: {
        content: "Connects the bot to your current voice channel 24/7",
        examples: ["connect"],
        usage: "connect",
      },
      category: "voice",
      aliases: ["join", "vc"],
      cooldown: 5,
      args: false,
      permissions: {
        dev: false,
        client: [
          "SendMessages",
          "ViewChannel",
          "EmbedLinks",
          "Connect",
          "Speak",
        ],
        user: [],
      },
      slashCommand: true,
      options: [],
    });
  }

  async run(client, ctx) {
    const member = ctx.member;
    const memberVoiceChannel = member?.voice?.channel;

    if (!memberVoiceChannel) {
      return ctx.sendMessage({
        content: "You must be in a voice channel to use this command.",
        ephemeral: true,
      });
    }

    const existing = getVoiceConnection(ctx.guild.id);
    if (existing) {
      return ctx.sendMessage({
        content: `Already connected to <#${existing.joinConfig.channelId}>. Use \`/leave\` first if you want to switch channels.`,
        ephemeral: true,
      });
    }

    await ctx.sendDeferMessage("Connecting...");

    try {
      const connection = joinVoiceChannel({
        channelId: memberVoiceChannel.id,
        guildId: memberVoiceChannel.guild.id,
        adapterCreator: memberVoiceChannel.guild.voiceAdapterCreator,
        selfDeaf: true,
        selfMute: false,
      });

      const player = createAudioPlayer();
      // Silent stream keeps the connection alive without audible audio
      player.play(createAudioResource(new SilenceStream()));
      connection.subscribe(player);

      connection.on(VoiceConnectionStatus.Disconnected, async () => {
        try {
          await Promise.race([
            entersState(connection, VoiceConnectionStatus.Signalling, 5000),
            entersState(connection, VoiceConnectionStatus.Connecting, 5000),
          ]);
        } catch {
          connection.destroy();
        }
      });

      await ctx.editMessage({
        content: `Connected to **${memberVoiceChannel.name}**.`,
      });
    } catch (error) {
      client.logger.error(error);
      await ctx.editMessage({
        content: "Failed to connect to the voice channel.",
      });
    }
  }
};
