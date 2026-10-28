'use client';

import { useActionState, useEffect, useState } from 'react';
import type { CategoryActionState, CategoryFormValues } from '../actions';
import { slugifyCategoryName } from '../schemas';
import { SubmitButton } from './submit-button';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

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
          className="rounded-sm border border-destructive/30 bg-destructive/10 px-4 py-3 text-body-sm text-destructive"
        >
          {state.message}
        </p>
      ) : null}
      <Field>
        <FieldLabel htmlFor="name">Name</FieldLabel>
        <Input
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
          aria-invalid={Boolean(error('name'))}
          aria-describedby={error('name') ? 'name-error' : undefined}
        />
        <FieldError id="name-error">{error('name')}</FieldError>
      </Field>
      <Field>
        <FieldLabel htmlFor="slug">Slug</FieldLabel>
        <Input
          id="slug"
          name="slug"
          value={values.slug}
          onChange={(event) => {
            setSlugTouched(true);
            setValues((current) => ({ ...current, slug: event.target.value }));
          }}
          aria-invalid={Boolean(error('slug'))}
          aria-describedby={error('slug') ? 'slug-error' : undefined}
        />
        <FieldError id="slug-error">{error('slug')}</FieldError>
      </Field>
      <FieldLabel className="flex items-center gap-3">
        <Checkbox
          name="isActive"
          checked={values.isActive}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              isActive: event.target.checked,
            }))
          }
        />
        Active in the public storefront
      </FieldLabel>
      <SubmitButton>{submitLabel}</SubmitButton>
    </form>
  );
}
