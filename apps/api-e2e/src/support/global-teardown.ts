import { killPort } from '@nx/node/utils';
import { spawnSync } from 'node:child_process';
/* eslint-disable */

module.exports = async function() {
  // Put clean up logic here (e.g. stopping services, docker-compose, etc.).
  // Hint: `globalThis` is shared between setup and teardown.
  const port = process.env.API_PORT ? Number(process.env.API_PORT) : process.env.PORT ? Number(process.env.PORT) : 3000;
  const hasLsof = spawnSync('sh', ['-lc', 'command -v lsof'], { stdio: 'ignore' }).status === 0;

  if (hasLsof) {
    await killPort(port);
  } else {
    console.log(`Skipping port cleanup for ${port}; lsof is unavailable in this environment.`);
  }
  console.log(globalThis.__TEARDOWN_MESSAGE__);
};
