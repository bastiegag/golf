import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/layout/container';
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
        <Container className="flex min-h-20 items-center justify-between gap-6">
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
            <Link href="/admin/categories" className="text-sm font-medium underline underline-offset-4">
              Categories
            </Link>
            <Link href="/admin/orders" className="text-sm font-medium underline underline-offset-4">
              Orders
            </Link>
            <p className="hidden text-sm text-muted-foreground sm:block">
              {user.name || user.email}
            </p>
            <form action={logoutAction}>
              <Button
                type="submit"
                variant="ghost"
                className="p-0 text-sm font-medium underline underline-offset-4"
              >
                Sign out
              </Button>
            </form>
          </div>
          </Container>
      </header>
      <main>
        <Container className="py-12">{children}</Container>
      </main>
    </div>
  );
}
