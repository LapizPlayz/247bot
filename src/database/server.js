const Database = require("better-sqlite3");
const config = require("../config.js");
const db = new Database("./bot.db", {
  fileMustExist: false,
  readonly: false,
});
db.pragma("journal_mode=WAL");

module.exports = class ServerData {
  constructor() {
    this.intialize();
  }
  intialize() {
    db.prepare(
      "CREATE TABLE IF NOT EXISTS guild (guildId TEXT PRIMARY KEY, prefix TEXT)"
    ).run();
  }
  get(guildId) {
    let data = db.prepare("SELECT * FROM guild WHERE guildId = ?").get(guildId);
    if (!data) {
      db.prepare("INSERT INTO guild (guildId) VALUES (?)").run(guildId);
      data = db.prepare("SELECT * FROM guild WHERE guildId = ?").get(guildId);
    }
    return data;
  }
  setPrefix(guildId, prefix) {
    const data = db
      .prepare("SELECT * FROM guild WHERE guildId = ?")
      .get(guildId);
    if (!data) {
      db.prepare("INSERT INTO guild (guildId, prefix) VALUES (?, ?)").run(
        guildId,
        prefix
      );
    } else {
      db.prepare("UPDATE guild SET prefix = ? WHERE guildId = ?").run(
        prefix,
        guildId
      );
    }
  }
  getPrefix(guildId) {
    const data = db
      .prepare("SELECT * FROM guild WHERE guildId = ?")
      .get(guildId);
    if (!data) {
      db.prepare("INSERT INTO guild (guildId, prefix) VALUES (?, ?)").run(
        guildId,
        config.prefix
      );
      return {
        prefix: config.prefix,
      };
    } else {
      return data;
    }
  }
};
