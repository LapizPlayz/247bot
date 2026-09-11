const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

const Command = require("../../structures/Command.js");

module.exports = class Invite extends Command {
  constructor(client) {
    super(client, {
      name: "invite",
      description: {
        content: "Sends the bot's invite link",
        examples: ["invite"],
        usage: "invite",
      },
      category: "info",
      aliases: ["inv"],
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
    if (!clientId) {
      console.error(
        "Client ID not found in environment variables, cannot generate invite link."
      );
      return await ctx.sendMessage(
        "Sorry, my invite link is not available at this time. Please tell the bot developer to check their console."
      );
    }
    const embed = this.client.embed();
    const buttons = [
      new ButtonBuilder()
        .setLabel("Invite")
        .setStyle(ButtonStyle.Link)
        .setURL(
          `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=8&scope=bot%20applications.commands`
        ),
    ];
    // Optional: set SUPPORT_SERVER_INVITE in your .env to show a support-server button too.
    if (process.env.SUPPORT_SERVER_INVITE) {
      buttons.push(
        new ButtonBuilder()
          .setLabel("Support Server")
          .setStyle(ButtonStyle.Link)
          .setURL(process.env.SUPPORT_SERVER_INVITE)
      );
    }
    const row = new ActionRowBuilder().addComponents(buttons);
    return await ctx.sendMessage({
      embeds: [
        embed
          .setColor(this.client.color.main)
          .setDescription(`You can invite me by clicking the button below.`),
      ],
      components: [row],
    });
  }
};
