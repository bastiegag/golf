'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { loginAction, type LoginActionState } from '../actions';

const initialState: LoginActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Signing in…' : 'Sign in'}
    </Button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="mt-8 space-y-5">
      {state.message ? (
        <p role="alert" className="rounded-sm bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.message}
        </p>
      ) : null}
      <div>
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          aria-invalid={Boolean(state.fieldErrors?.email)}
          className="mt-2 w-full rounded-sm border border-border bg-background px-3 py-3 text-sm focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#829c88]"
        />
        {state.fieldErrors?.email ? (
          <p className="mt-1 text-sm text-red-700">
            {state.fieldErrors.email}
          </p>
        ) : null}
      </div>
      <div>
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={Boolean(state.fieldErrors?.password)}
          className="mt-2 w-full rounded-sm border border-border bg-background px-3 py-3 text-sm focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#829c88]"
        />
        {state.fieldErrors?.password ? (
          <p className="mt-1 text-sm text-red-700">
            {state.fieldErrors.password}
          </p>
        ) : null}
      </div>
      <SubmitButton />
    </form>
  );
}
