# Always-On Discord Bot

A minimal Discord bot skeleton — supports both `!prefix` and `/slash` commands —
built to run 24/7 on [Render](https://render.com). This started as a fork of a
music bot; all music/Lavalink functionality has been removed, leaving just the
command handler, event handler, and a small plugin system to build on.

## Features

- Hybrid commands: every command works as both a text command (`!ping`) and a
  slash command (`/ping`)
- Per-guild custom prefix (`/prefix set`)
- Category-based command loading — drop a new `.js` file in `src/commands/<category>/`
  and it's automatically registered
- A small plugin system (`src/plugin/plugins/`) — currently: anti-crash
  handling, a fun `!advice` easter egg, and the keep-alive HTTP server
- Built-in commands: `about`, `help`, `info`, `invite`, `ping`, `prefix`, plus
  owner-only `eval`, `guildlist`, `guildleave`

## Local setup

```bash
git clone <your-fork-url>
cd 247bot-main
npm install
cp .env.example .env
# fill in TOKEN and CLIENT_ID in .env - see below
npm run dev
```

Get `TOKEN` and `CLIENT_ID` from the [Discord Developer Portal](https://discord.com/developers/applications):
create an application, go to the **Bot** tab for the token, and use the
**Application ID** on the General Information page as `CLIENT_ID`. Under the
**Bot** tab, enable the **Message Content** and **Server Members** privileged
intents (the bot needs these for prefix commands and permission checks).

## Deploying to Render

Discord bots hold a persistent WebSocket connection to Discord's gateway -
they're a background process, not something that only responds to inbound
HTTP requests. Render's **free Web Service tier still spins the service down
after ~15 minutes with no inbound HTTP traffic**, even if the bot process
itself is alive and connected to Discord. That's what the built-in
`keepAlive` plugin is for: it starts a tiny HTTP server on Render's assigned
`$PORT`, giving you a URL an external uptime pinger can hit periodically to
keep the free instance awake. If you're on a paid Render instance type
instead, it never sleeps and you don't need the pinger - the HTTP server
still needs to exist either way, since Render's web service health checks
require *something* listening on the port.

**Steps:**

1. Push this repo to your own GitHub repo.
2. In the Render dashboard: **New -> Web Service**, connect the repo.
   - If Render detects `render.yaml` in the repo, it'll offer to use it
     directly (Blueprint) - that pre-fills most of the settings below.
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
3. Add environment variables (Render -> your service -> *Environment*): at minimum
   `TOKEN` and `CLIENT_ID`. See `.env.example` for the full list. Do **not**
   set `PORT` yourself - Render assigns it automatically.
4. Deploy. Once it's live, Render gives you a URL like
   `https://your-service.onrender.com` - opening it should show
   `I'm alive! Serving N guild(s)...`, and `/health` returns a small JSON
   status blob.
5. **If you're on the free instance type**, point an external uptime monitor
   (e.g. [UptimeRobot](https://uptimerobot.com), [cron-job.org](https://cron-job.org))
   at that URL, pinging every 5-10 minutes, so Render doesn't spin it down.
   Render doesn't officially support this as a way to avoid spin-down - it's
   a common workaround, not a guarantee - so if uptime matters, a paid
   instance type is the reliable option. Also note free Render services
   don't get a persistent disk, so the SQLite database (guild prefixes) is
   reset on every deploy or restart; that's fine for a small hobby bot, but
   worth knowing.

Render's free-tier terms change over time, so double-check current details
on [Render's pricing page](https://render.com/pricing) before you rely on
this.

## Project structure

```
src/
  index.js           entry point, prints a banner, then starts the client
  client.js          creates the discord.js Client and its intents
  config.js          loads settings from environment variables
  structures/        base classes: Client, Command, Event, Context, Logger
  commands/          one folder per command category
  events/Client/     discord.js event handlers (messageCreate, ready, etc.)
  plugin/plugins/    small self-contained plugins loaded at startup
  database/          a tiny SQLite wrapper (currently just per-guild prefix)
  utils/             formatting/pagination helpers
```

To add a command, copy an existing file in `src/commands/<category>/` (e.g.
`Ping.js`) and change `name`, `description`, and `run()`. It's picked up
automatically on next boot - no manual registration needed.
