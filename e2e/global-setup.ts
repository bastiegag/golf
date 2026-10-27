import { execFileSync } from 'node:child_process';
import { loadTestEnvironment } from '../scripts/test-environment';

export default function globalSetup() {
  const environment = loadTestEnvironment();
  if (!process.env.AUTH_SECRET) {
    throw new Error(
      'Set AUTH_SECRET before running Playwright authentication tests.',
    );
  }

  const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  execFileSync(npmCommand, ['run', 'db:migrate:deploy'], {
    env: environment,
    stdio: 'inherit',
  });
  execFileSync(npmCommand, ['run', 'db:seed'], {
    env: environment,
    stdio: 'inherit',
  });
  execFileSync(npmCommand, ['exec', 'tsx', 'scripts/ensure-e2e-admin.ts'], {
    env: environment,
    stdio: 'inherit',
  });
}
