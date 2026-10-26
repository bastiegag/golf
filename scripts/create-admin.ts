import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import { createInterface } from 'node:readline';
import { adminProvisioningSchema } from '../src/features/auth/schemas';
import { hashPassword } from '../src/features/auth/password';

function question(prompt: string) {
  const readline = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise<string>((resolve) => {
    readline.question(prompt, (answer) => {
      readline.close();
      resolve(answer);
    });
  });
}

function secretQuestion(prompt: string) {
  process.stdout.write(prompt);
  const input = process.stdin;
  input.setRawMode?.(true);
  input.resume();

  return new Promise<string>((resolve) => {
    let value = '';
    const onData = (chunk: Buffer) => {
      const character = chunk.toString();
      if (character === '\u0003') {
        process.exit(1);
      }
      if (character === '\r' || character === '\n') {
        input.setRawMode?.(false);
        input.pause();
        input.off('data', onData);
        process.stdout.write('\n');
        resolve(value);
      } else if (character === '\u007f') {
        value = value.slice(0, -1);
      } else {
        value += character;
      }
    };
    input.on('data', onData);
  });
}

async function main() {
  const email = process.env.ADMIN_EMAIL ?? (await question('Admin email: '));
  const password =
    process.env.ADMIN_PASSWORD ?? (await secretQuestion('Admin password: '));
  const result = adminProvisioningSchema.safeParse({ email, password });

  if (!result.success) {
    throw new Error(result.error.issues[0]?.message ?? 'Invalid admin details.');
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('Set DATABASE_URL before provisioning an administrator.');
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
  });

  try {
    const existing = await prisma.user.findUnique({
      where: { email: result.data.email },
      select: { id: true },
    });
    if (existing) {
      throw new Error(
        'An administrator with this email already exists. Passwords are not overwritten.',
      );
    }

    await prisma.user.create({
      data: {
        email: result.data.email,
        name: result.data.email.split('@')[0] ?? 'Administrator',
        passwordHash: await hashPassword(result.data.password),
        role: 'ADMIN',
      },
    });
    console.log(`Administrator ${result.data.email} created.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Provisioning failed.');
  process.exitCode = 1;
});
