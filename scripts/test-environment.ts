import { config as loadDotenv } from 'dotenv';
import { URL } from 'node:url';

loadDotenv();

const TEST_DATABASE_NAME = 'golf_test';

function parseDatabaseUrl(connectionString: string) {
  let url: URL;
  try {
    url = new URL(connectionString);
  } catch {
    throw new Error('E2E_DATABASE_URL must be a valid PostgreSQL connection URL.');
  }

  if (!['postgres:', 'postgresql:'].includes(url.protocol)) {
    throw new Error('E2E_DATABASE_URL must use the PostgreSQL protocol.');
  }

  const databaseName = decodeURIComponent(
    url.pathname.slice(1).split('/')[0] ?? '',
  );
  if (!databaseName) {
    throw new Error('E2E_DATABASE_URL must name an explicit test database.');
  }

  return {
    databaseName,
    target: `${url.protocol}//${url.hostname}:${url.port || '5432'}${url.pathname}`,
  };
}

export function loadTestEnvironment() {
  const testDatabaseUrl = process.env.E2E_DATABASE_URL;
  if (!testDatabaseUrl) {
    throw new Error(
      'E2E_DATABASE_URL is required for database tests; refusing to fall back to DATABASE_URL.',
    );
  }

  const developmentDatabaseUrl = process.env.DATABASE_URL;
  const testDatabase = parseDatabaseUrl(testDatabaseUrl);
  const developmentDatabase =
    developmentDatabaseUrl && parseDatabaseUrl(developmentDatabaseUrl);

  if (developmentDatabase && testDatabase.target === developmentDatabase.target) {
    throw new Error(
      'E2E_DATABASE_URL must differ from DATABASE_URL; refusing to mutate the development database.',
    );
  }

  const { databaseName } = testDatabase;
  if (databaseName !== TEST_DATABASE_NAME) {
    throw new Error(
      `E2E_DATABASE_URL must target the explicitly configured "${TEST_DATABASE_NAME}" database.`,
    );
  }

  if (/(production|prod|staging|stage)/i.test(databaseName)) {
    throw new Error('E2E_DATABASE_URL must not target a production or staging database.');
  }

  return {
    ...process.env,
    DATABASE_URL: testDatabaseUrl,
  };
}
