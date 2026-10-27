'use client';

import { useActionState, useEffect, useState } from 'react';
import type { CategoryActionState, CategoryFormValues } from '../actions';
import { slugifyCategoryName } from '../schemas';
import { SubmitButton } from './submit-button';

type CategoryFormProps = {
  initialValues: CategoryFormValues;
  action: (
    state: CategoryActionState,
    formData: FormData,
  ) => Promise<CategoryActionState>;
  submitLabel: string;
};

export function CategoryForm({
  initialValues,
  action,
  submitLabel,
}: CategoryFormProps) {
  const [state, formAction] = useActionState<CategoryActionState, FormData>(
    action,
    {},
  );
  const [values, setValues] = useState(initialValues);
  const [slugTouched, setSlugTouched] = useState(
    Boolean(
      initialValues.slug &&
        initialValues.slug !== slugifyCategoryName(initialValues.name),
    ),
  );

  useEffect(() => {
    if (state.values) setValues(state.values);
  }, [state.values]);

  const error = (field: keyof CategoryFormValues) => state.fieldErrors?.[field];

  return (
    <form action={formAction} className="space-y-8">
      {state.message ? (
        <p
          role="alert"
          className="rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
        >
          {state.message}
        </p>
      ) : null}
      <div>
        <label htmlFor="name" className="mb-2 block text-sm font-medium">
          Name
        </label>
        <input
          id="name"
          name="name"
          value={values.name}
          onChange={(event) => {
            const name = event.target.value;
            setValues((current) => ({
              ...current,
              name,
              slug: slugTouched ? current.slug : slugifyCategoryName(name),
            }));
          }}
          className="w-full rounded-sm border border-border bg-background px-3 py-3"
          aria-invalid={Boolean(error('name'))}
          aria-describedby={error('name') ? 'name-error' : undefined}
        />
        {error('name') ? (
          <p id="name-error" className="mt-2 text-sm text-red-800">
            {error('name')}
          </p>
        ) : null}
      </div>
      <div>
        <label htmlFor="slug" className="mb-2 block text-sm font-medium">
          Slug
        </label>
        <input
          id="slug"
          name="slug"
          value={values.slug}
          onChange={(event) => {
            setSlugTouched(true);
            setValues((current) => ({ ...current, slug: event.target.value }));
          }}
          className="w-full rounded-sm border border-border bg-background px-3 py-3"
          aria-invalid={Boolean(error('slug'))}
          aria-describedby={error('slug') ? 'slug-error' : undefined}
        />
        {error('slug') ? (
          <p id="slug-error" className="mt-2 text-sm text-red-800">
            {error('slug')}
          </p>
        ) : null}
      </div>
      <label className="flex items-center gap-3 text-sm font-medium">
        <input
          type="checkbox"
          name="isActive"
          checked={values.isActive}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              isActive: event.target.checked,
            }))
          }
          className="size-4 accent-[var(--accent)]"
        />
        Active in the public storefront
      </label>
      <SubmitButton>{submitLabel}</SubmitButton>
    </form>
  );
}
