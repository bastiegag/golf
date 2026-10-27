import { spawnSync } from 'node:child_process';
import { loadTestEnvironment } from './test-environment';

const environment = loadTestEnvironment();
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const commands = [
  ['run', 'db:migrate:deploy'],
  ['run', 'db:seed'],
  ['exec', 'tsx', 'scripts/ensure-e2e-admin.ts'],
  ['exec', '--', 'vitest', 'run', '--config', 'vitest.integration.config.mts'],
] as const;

for (const args of commands) {
  const result = spawnSync(npmCommand, args, {
    env: environment,
    stdio: 'inherit',
  });

  if (result.error) {
    console.error(`Unable to run ${npmCommand} ${args.join(' ')}: ${result.error.message}`);
    process.exitCode = 1;
    break;
  }

  if (result.status !== 0) {
    process.exitCode = result.status ?? 1;
    break;
  }
}
