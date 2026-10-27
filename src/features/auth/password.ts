import {
  randomBytes,
  scrypt as nodeScrypt,
  timingSafeEqual,
} from 'node:crypto';

const KEY_LENGTH = 64;
const SCRYPT_OPTIONS = { N: 16384, r: 8, p: 1 };

function deriveKey(
  password: string,
  salt: Buffer,
  keyLength: number,
  options: { N: number; r: number; p: number },
) {
  return new Promise<Buffer>((resolve, reject) => {
    nodeScrypt(password, salt, keyLength, options, (error, derivedKey) => {
      if (error) {
        reject(error);
      } else {
        resolve(derivedKey);
      }
    });
  });
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const derivedKey = await deriveKey(
    password,
    salt,
    KEY_LENGTH,
    SCRYPT_OPTIONS,
  );

  return [
    'scrypt',
    `N=${SCRYPT_OPTIONS.N},r=${SCRYPT_OPTIONS.r},p=${SCRYPT_OPTIONS.p}`,
    salt.toString('base64url'),
    derivedKey.toString('base64url'),
  ].join('$');
}

export async function verifyPassword(password: string, storedHash: string) {
  const [algorithm, parameters, encodedSalt, encodedHash] = storedHash.split('$');
  if (
    algorithm !== 'scrypt' ||
    !parameters ||
    !encodedSalt ||
    !encodedHash
  ) {
    return false;
  }

  const values = new URLSearchParams(parameters.replaceAll(',', '&'));
  const N = Number(values.get('N'));
  const r = Number(values.get('r'));
  const p = Number(values.get('p'));
  if (
    !Number.isSafeInteger(N) ||
    !Number.isSafeInteger(r) ||
    !Number.isSafeInteger(p) ||
    N <= 1 ||
    N > 1_048_576 ||
    (N & (N - 1)) !== 0 ||
    r <= 0 ||
    r > 32 ||
    p <= 0 ||
    p > 16
  ) {
    return false;
  }

  try {
    const salt = Buffer.from(encodedSalt, 'base64url');
    const expected = Buffer.from(encodedHash, 'base64url');
    const actual = await deriveKey(password, salt, expected.length, { N, r, p });

    return (
      actual.length === expected.length && timingSafeEqual(actual, expected)
    );
  } catch {
    return false;
  }
}
