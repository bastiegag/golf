import type { Metadata } from 'next';
import Link from 'next/link';
import { logoutAction } from '@/features/auth/actions';
import { requireAdmin } from '@/features/auth/authorization';

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s | Golf Admin' },
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireAdmin();

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
          <Link
            href="/admin"
            className="text-xl font-semibold tracking-[0.16em]"
            aria-label="Golf admin dashboard"
          >
            GOLF ADMIN
          </Link>
          <div className="flex items-center gap-5">
            <Link href="/admin/products" className="text-sm font-medium underline underline-offset-4">
              Products
            </Link>
            <p className="hidden text-sm text-muted-foreground sm:block">
              {user.name || user.email}
            </p>
            <form action={logoutAction}>
              <button
                type="submit"
                className="text-sm font-medium underline underline-offset-4 focus-visible:outline-offset-4"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-12 sm:px-8">{children}</main>
    </div>
  );
}
