'use strict';
const cfg = require('./lib/config');
const { problems, warnings } = cfg.validate();
if (problems.length) { console.error('\nJobLancer cannot start:\n - ' + problems.join('\n - ') + '\n'); process.exit(1); }
warnings.forEach((w) => console.warn('WARNING: ' + w));

const { backup } = require('./lib/db');
const app = require('./lib/app');
const { createServer } = require('./lib/http');

(async () => {
  await app.seedAdmin();
  await app.seedDemo();
  backup();
  setInterval(app.autoRelease, 10 * 60 * 1000).unref();
  setInterval(backup, 24 * 3600 * 1000).unref();
  const server = createServer(app.loadUser);
  server.listen(cfg.port, () => console.log('JobLancer running on port ' + cfg.port + (cfg.prod ? ' (production)' : ' (development)')));
  const stop = () => { server.close(() => process.exit(0)); setTimeout(() => process.exit(0), 5000).unref(); };
  process.on('SIGTERM', stop); process.on('SIGINT', stop);
})().catch((e) => { console.error(e); process.exit(1); });
