const http = require('http');

// Render's Web Service type requires the process to bind to $PORT, or the
// deploy is marked unhealthy. This server also gives you a URL to point an
// external uptime pinger (e.g. UptimeRobot, cron-job.org) at, which is the
// standard way to stop a free Render web service from spinning down after
// 15 minutes of inactivity. See the README for details.
const keepAlive = {
    name: 'KeepAlive Plugin',
    version: '2.0.0',
    initialize: (client) => {
        const startedAt = Date.now();
        const server = http.createServer((req, res) => {
            const uptimeSeconds = Math.floor((Date.now() - startedAt) / 1000);
            if (req.url === '/health') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(
                    JSON.stringify({
                        status: client.isReady() ? 'ok' : 'starting',
                        uptimeSeconds,
                        guilds: client.isReady() ? client.guilds.cache.size : 0,
                    })
                );
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(
                client.isReady()
                    ? `I'm alive! Serving ${client.guilds.cache.size} guild(s). Uptime: ${uptimeSeconds}s`
                    : "Starting up..."
            );
        });
        server.listen(client.config.port, () => {
            client.logger.info(`Keep-alive server listening on port ${client.config.port}`);
        });
    },
};

module.exports = keepAlive;
