import { createConnection } from 'node:net';

/* eslint-disable */
var __TEARDOWN_MESSAGE__: string;

async function waitForPortOpen(port: number, host: string, timeoutMs = 30000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const opened = await new Promise<boolean>((resolve) => {
      const socket = createConnection({ port, host });

      const finish = (value: boolean) => {
        socket.removeAllListeners();
        socket.destroy();
        resolve(value);
      };

      socket.setTimeout(1000);
      socket.once('connect', () => finish(true));
      socket.once('error', () => finish(false));
      socket.once('timeout', () => finish(false));
    });

    if (opened) return;

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(`Timed out waiting for ${host}:${port} to become available.`);
}

module.exports = async function() {
  // Start services that that the app needs to run (e.g. database, docker-compose, etc.).
  console.log('\nSetting up...\n');

  const host = process.env.HOST ?? 'localhost';
  const port = process.env.API_PORT ? Number(process.env.API_PORT) : process.env.PORT ? Number(process.env.PORT) : 3000;
  await waitForPortOpen(port, host);

  // Hint: Use `globalThis` to pass variables to global teardown.
  globalThis.__TEARDOWN_MESSAGE__ = '\nTearing down...\n';
};
