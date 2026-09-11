const {
  Client,
  Collection,
  EmbedBuilder,
  ApplicationCommandType,
  PermissionsBitField,
  REST,
  Routes,
} = require("discord.js");
const fs = require("fs");
const path = require("path");
const Logger = require("./Logger.js");
const config = require("../config.js");
const ServerData = require("../database/server.js");
const loadPlugins = require("../plugin/index.js");
const Utils = require("../utils/Utils.js");

module.exports = class BotClient extends Client {
  constructor(options) {
    super(options);
    this.commands = new Collection();
    this.aliases = new Collection();
    this.db = new ServerData();
    this.cooldown = new Collection();
    this.config = config;
    this.logger = new Logger();
    this.color = config.color;
    this.body = [];
    this.utils = Utils;
  }

  embed() {
    return new EmbedBuilder();
  }

  async start(token) {
    this.loadCommands();
    this.logger.info(`Successfully loaded commands!`);
    this.loadEvents();
    this.logger.info(`Successfully loaded events!`);
    loadPlugins(this);
    await this.login(token);
  }

  loadCommands() {
    const commandsRoot = path.join(__dirname, "../commands");
    const categories = fs.readdirSync(commandsRoot).filter((entry) => {
      return fs.statSync(path.join(commandsRoot, entry)).isDirectory();
    });
    categories.forEach((dir) => {
      const commandFiles = fs
        .readdirSync(path.join(commandsRoot, dir))
        .filter((file) => file.endsWith(".js"));
      commandFiles.forEach(async (file) => {
        const cmd = require(`../commands/${dir}/${file}`);
        const command = new cmd(this, file);
        command.category = dir;
        this.commands.set(command.name, command);
        if (command.aliases.length !== 0) {
          command.aliases.forEach((alias) => {
            this.aliases.set(alias, command.name);
          });
        }
        if (command.slashCommand) {
          const data = {
            name: command.name,
            description: command.description.content,
            type: ApplicationCommandType.ChatInput,
            options: command.options ? command.options : null,
            name_localizations: command.nameLocalizations
              ? command.nameLocalizations
              : null,
            description_localizations: command.descriptionLocalizations
              ? command.descriptionLocalizations
              : null,
            default_member_permissions:
              command.permissions.user.length > 0
                ? command.permissions.user
                : null,
          };
          if (command.permissions.user.length > 0) {
            const permissionValue = PermissionsBitField.resolve(
              command.permissions.user
            );
            if (typeof permissionValue === "bigint") {
              data.default_member_permissions = permissionValue.toString();
            } else {
              data.default_member_permissions = permissionValue;
            }
          }
          const json = JSON.stringify(data);
          this.body.push(JSON.parse(json));
        }
      });
    });
    this.once("ready", async () => {
      const applicationCommands =
        this.config.production === true
          ? Routes.applicationCommands(this.user.id ?? "")
          : Routes.applicationGuildCommands(
              this.user.id ?? "",
              this.config.guildId ?? ""
            );
      try {
        const rest = new REST({ version: "9" }).setToken(
          this.config.token ?? ""
        );
        await rest.put(applicationCommands, { body: this.body });
        this.logger.info(`Successfully loaded slash commands!`);
      } catch (error) {
        this.logger.error(error);
      }
    });
  }

  loadEvents() {
    const eventsPath = fs.readdirSync(path.join(__dirname, "../events"));
    eventsPath.forEach((dir) => {
      try {
        const events = fs
          .readdirSync(path.join(__dirname, `../events/${dir}`))
          .filter((file) => file.endsWith(".js"));
        events.forEach((file) => {
          try {
            const EventClass = require(`../events/${dir}/${file}`);
            const evt = new EventClass(this, file);
            this.on(evt.name, (...args) => evt.run(...args));
          } catch (error) {
            console.error(`Error loading event ${file}:`, error);
          }
        });
      } catch (error) {
        console.error(`Error reading directory ${dir}:`, error);
      }
    });
  }
};
