'use server';

import { AuthError } from 'next-auth';
import { signIn, signOut } from '../../../auth';
import { loginSchema } from './schemas';

export type LoginActionState = {
  message?: string;
  fieldErrors?: Partial<Record<'email' | 'password', string>>;
};

export async function loginAction(
  _previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const result = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!result.success) {
    return {
      message: 'Review the highlighted fields.',
      fieldErrors: Object.fromEntries(
        result.error.issues.map((issue) => [
          String(issue.path[0]),
          issue.message,
        ]),
      ),
    };
  }

  try {
    await signIn('credentials', {
      email: result.data.email,
      password: result.data.password,
      redirectTo: '/admin',
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { message: 'Invalid email or password.' };
    }
    throw error;
  }

  return {};
}

export async function logoutAction() {
  await signOut({ redirectTo: '/admin/login' });
}
