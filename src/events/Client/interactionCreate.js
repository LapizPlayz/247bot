const Event = require("../../structures/Event.js");
const {
  Collection,
  CommandInteraction,
  InteractionType,
  PermissionFlagsBits,
} = require("discord.js");
const Context = require("../../structures/Context.js");

module.exports = class InteractionCreate extends Event {
  constructor(client, file) {
    super(client, file, {
      name: "interactionCreate",
    });
  }
  async run(interaction) {
    if (
      interaction instanceof CommandInteraction &&
      interaction.type === InteractionType.ApplicationCommand
    ) {
      const { commandName } = interaction;
      const command = this.client.commands.get(interaction.commandName);
      if (!command) return;
      const ctx = new Context(interaction, interaction.options.data);
      ctx.setArgs(interaction.options.data);
      if (
        !interaction.inGuild() ||
        !interaction.channel
          .permissionsFor(interaction.guild.members.me)
          .has(PermissionFlagsBits.ViewChannel)
      )
        return;
      if (
        !interaction.guild.members.me.permissions.has(
          PermissionFlagsBits.SendMessages
        )
      ) {
        return await interaction.member
          .send({
            content: `I don't have **\`SendMessage\`** permission in \`${interaction.guild.name}\`\nchannel: <#${interaction.channelId}>`,
          })
          .catch(() => {});
      }
      if (
        !interaction.guild.members.me.permissions.has(
          PermissionFlagsBits.EmbedLinks
        )
      )
        return await interaction.reply({
          content: "I don't have **`EmbedLinks`** permission.",
        });
      if (command.permissions) {
        if (command.permissions.client) {
          if (
            !interaction.guild.members.me.permissions.has(
              command.permissions.client
            )
          )
            return await interaction.reply({
              content:
                "I don't have enough permissions to execute this command.",
            });
        }
        if (command.permissions.user) {
          if (!interaction.member.permissions.has(command.permissions.user)) {
            await interaction.reply({
              content: "You don't have enough permissions to use this command.",
              ephemeral: true,
            });
            return;
          }
        }
        if (command.permissions.dev) {
          if (this.client.config.owners) {
            const findDev = this.client.config.owners.find(
              (x) => x === interaction.user.id
            );
            if (!findDev) return;
          }
        }
      }
      if (!this.client.cooldown.has(commandName)) {
        this.client.cooldown.set(commandName, new Collection());
      }
      const now = Date.now();
      const timestamps = this.client.cooldown.get(commandName);
      const cooldownAmount = Math.floor(command.cooldown || 5) * 1000;
      if (!timestamps.has(interaction.user.id)) {
        timestamps.set(interaction.user.id, now);
        setTimeout(
          () => timestamps.delete(interaction.user.id),
          cooldownAmount
        );
      } else {
        const expirationTime =
          timestamps.get(interaction.user.id) + cooldownAmount;
        const timeLeft = (expirationTime - now) / 1000;
        if (now < expirationTime && timeLeft > 0.9) {
          return await interaction.reply({
            content: `Please wait ${timeLeft.toFixed(
              1
            )} more second(s) before reusing the \`${commandName}\` command.`,
          });
        }
        timestamps.set(interaction.user.id, now);
        setTimeout(
          () => timestamps.delete(interaction.user.id),
          cooldownAmount
        );
      }

      try {
        await command.run(this.client, ctx, ctx.args);
      } catch (error) {
        this.client.logger.error(error);
        await interaction.reply({ content: `An error occurred: \`${error}\`` });
      }
    }
  }
};
