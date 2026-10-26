import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/features/auth/components/login-form';
import { getCurrentUser } from '@/features/auth/authorization';

export const metadata: Metadata = {
  title: 'Administrator sign in',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminLoginPage() {
  if (await getCurrentUser()) {
    redirect('/admin');
  }

  return (
    <div className="mx-auto max-w-md px-5 py-16 sm:px-8 sm:py-24">
      <p className="mb-4 text-xs font-semibold tracking-[0.24em] text-muted-foreground uppercase">
        Golf administration
      </p>
      <h1 className="text-4xl font-medium tracking-[-0.045em]">
        Administrator sign in
      </h1>
      <p className="mt-4 text-muted-foreground">
        Sign in to access the private administration dashboard.
      </p>
      <LoginForm />
    </div>
  );
}
