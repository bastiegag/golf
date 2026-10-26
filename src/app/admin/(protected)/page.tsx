import { requireAdmin } from '@/features/auth/authorization';

export const metadata = {
  title: 'Dashboard',
};

export default async function AdminDashboardPage() {
  const user = await requireAdmin();

  return (
    <div>
      <p className="mb-4 text-xs font-semibold tracking-[0.24em] text-muted-foreground uppercase">
        Dashboard
      </p>
      <h1 className="text-4xl font-medium tracking-[-0.045em]">
        Welcome, {user.name || user.email}.
      </h1>
      <p className="mt-5 max-w-2xl leading-7 text-muted-foreground">
        You are signed in as an administrator. Product, category, and order
        management will be added in a future phase.
      </p>
    </div>
  );
}
