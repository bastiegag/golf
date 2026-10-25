import { execFileSync } from 'node:child_process';
import 'dotenv/config';

export default function globalSetup() {
  const databaseUrl = process.env.E2E_DATABASE_URL ?? process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      'Set E2E_DATABASE_URL (preferred) or DATABASE_URL before running Playwright tests.',
    );
  }

  const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const environment = {
    ...process.env,
    DATABASE_URL: databaseUrl,
  };

  execFileSync(npmCommand, ['run', 'db:migrate:deploy'], {
    env: environment,
    stdio: 'inherit',
  });
  execFileSync(npmCommand, ['run', 'db:seed'], {
    env: environment,
    stdio: 'inherit',
  });
}
