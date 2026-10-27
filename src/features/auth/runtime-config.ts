export function getAuthSecret(environment = process.env) {
  const secret = environment.AUTH_SECRET;
  const isProductionBuild =
    environment.NEXT_PHASE === 'phase-production-build';
  if (
    !isProductionBuild &&
    environment.NODE_ENV === 'production' &&
    (!secret || secret.length < 32)
  ) {
    throw new Error(
      'AUTH_SECRET must be configured with at least 32 characters in production.',
    );
  }
  return secret;
}
