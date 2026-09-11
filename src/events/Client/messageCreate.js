const Event = require("../../structures/Event.js");
const { Collection, PermissionFlagsBits } = require("discord.js");
const Context = require("../../structures/Context.js");

module.exports = class MessageCreate extends Event {
  constructor(client, file) {
    super(client, file, {
      name: "messageCreate",
    });
  }
  async run(message) {
    if (message.author.bot) return;
    let prefix = this.client.db.getPrefix(message.guildId);
    const mention = new RegExp(`^<@!?${this.client.user.id}>( |)$`);
    if (message.content.match(mention)) {
      await message.reply({
        content: `Hey, my prefix for this server is \`${prefix.prefix}\` Want more info? then do \`${prefix.prefix}help\`\nStay Safe, Stay Awesome!`,
      });
      return;
    }
    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const prefixRegex = new RegExp(
      `^(<@!?${this.client.user.id}>|${escapeRegex(prefix.prefix)})\\s*`
    );
    if (!prefixRegex.test(message.content)) return;
    const [matchedPrefix] = message.content.match(prefixRegex);
    const args = message.content
      .slice(matchedPrefix.length)
      .trim()
      .split(/ +/g);
    const cmd = args.shift().toLowerCase();
    const command =
      this.client.commands.get(cmd) ||
      this.client.commands.get(this.client.aliases.get(cmd));
    if (!command) return;
    const ctx = new Context(message, args);
    ctx.setArgs(args);
    let dm = message.author.dmChannel;
    if (typeof dm === "undefined") dm = await message.author.createDM();
    if (
      !message.inGuild() ||
      !message.channel
        .permissionsFor(message.guild.members.me)
        .has(PermissionFlagsBits.ViewChannel)
    )
      return;
    if (
      !message.guild.members.me.permissions.has(
        PermissionFlagsBits.SendMessages
      )
    )
      return await message.author
        .send({
          content: `I don't have **\`SendMessage\`** permission in \`${message.guild.name}\`\nchannel: <#${message.channelId}>`,
        })
        .catch(() => {});
    if (
      !message.guild.members.me.permissions.has(PermissionFlagsBits.EmbedLinks)
    )
      return await message.reply({
        content: "I don't have **`EmbedLinks`** permission.",
      });
    if (command.permissions) {
      if (command.permissions.client) {
        if (
          !message.guild.members.me.permissions.has(command.permissions.client)
        )
          return await message.reply({
            content: "I don't have enough permissions to execute this command.",
          });
      }
      if (command.permissions.user) {
        if (!message.member.permissions.has(command.permissions.user))
          return await message.reply({
            content: "You don't have enough permissions to use this command.",
          });
      }
      if (command.permissions.dev) {
        if (this.client.config.owners) {
          const findDev = this.client.config.owners.find(
            (x) => x === message.author.id
          );
          if (!findDev) return;
        }
      }
    }
    if (command.args) {
      if (!args.length) {
        const embed = this.client
          .embed()
          .setColor(this.client.color.red)
          .setTitle("Missing Arguments")
          .setDescription(
            `Please provide the required arguments for the \`${
              command.name
            }\` command.\n\nExamples:\n${
              command.description.examples
                ? command.description.examples.join("\n")
                : "None"
            }`
          )
          .setFooter({ text: "Syntax: [] = optional, <> = required" });
        return await message.reply({ embeds: [embed] });
      }
    }
    if (!this.client.cooldown.has(cmd)) {
      this.client.cooldown.set(cmd, new Collection());
    }
    const now = Date.now();
    const timestamps = this.client.cooldown.get(cmd);
    const cooldownAmount = Math.floor(command.cooldown || 5) * 1000;
    if (!timestamps.has(message.author.id)) {
      timestamps.set(message.author.id, now);
      setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    } else {
      const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
      const timeLeft = (expirationTime - now) / 1000;
      if (now < expirationTime && timeLeft > 0.9) {
        return await message.reply({
          content: `Please wait ${timeLeft.toFixed(
            1
          )} more second(s) before reusing the \`${cmd}\` command.`,
        });
      }
      timestamps.set(message.author.id, now);
      setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    }
    if (args.includes("@everyone") || args.includes("@here"))
      return await message.reply({
        content: "You can't use this command with everyone or here.",
      });
    try {
      return command.run(this.client, ctx, ctx.args);
    } catch (error) {
      this.client.logger.error(error);
      await message.reply({ content: `An error occurred: \`${error}\`` });
      return;
    }
  }
};
