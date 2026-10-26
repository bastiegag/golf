import 'server-only';

import { redirect } from 'next/navigation';
import { auth } from '../../../auth';
import { getActiveAdminById } from './queries';

export async function getCurrentUser() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return null;
  }

  return getActiveAdminById(userId);
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/admin/login');
  }

  return user;
}
