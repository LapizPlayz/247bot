const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

const Command = require("../../structures/Command.js");

module.exports = class About extends Command {
  constructor(client) {
    super(client, {
      name: "about",
      description: {
        content: "Shows information about the bot",
        examples: ["about"],
        usage: "about",
      },
      category: "info",
      aliases: ["ab"],
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
    const clientId = process.env.CLIENT_ID;
    const components = [];
    if (clientId) {
      components.push(
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setLabel("Invite me")
            .setStyle(ButtonStyle.Link)
            .setURL(
              `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=8&scope=bot%20applications.commands`
            )
        )
      );
    }
    const embed = this.client
      .embed()
      .setAuthor({
        name: this.client.user.username,
        iconURL: this.client.user.displayAvatarURL(),
      })
      .setThumbnail(this.client.user.displayAvatarURL())
      .setColor(this.client.color.main)
      .setDescription(
        `Hey, I'm ${this.client.user.username}! A general-purpose Discord bot, built to stay online 24/7.`
      )
      .addFields([
        { name: "Servers", value: `${client.guilds.cache.size}`, inline: true },
        { name: "Uptime", value: client.utils.formatTime(client.uptime), inline: true },
      ]);
    return await ctx.sendMessage({
      embeds: [embed],
      components,
    });
  }
};
