'use client';

import Image from 'next/image';
import { useActionState, useEffect, useState } from 'react';
import type { ProductActionState, ProductFormValues } from '../actions';
import { slugifyProductName } from '../schemas';
import { SubmitButton } from './submit-button';

type Category = { id: string; name: string };

type ProductFormProps = {
  categories: Category[];
  initialValues: ProductFormValues;
  action: (
    state: ProductActionState,
    formData: FormData,
  ) => Promise<ProductActionState>;
  submitLabel: string;
};

export function ProductForm({
  categories,
  initialValues,
  action,
  submitLabel,
}: ProductFormProps) {
  const [state, formAction] = useActionState<ProductActionState, FormData>(
    action,
    {},
  );
  const [values, setValues] = useState<ProductFormValues>(initialValues);
  const [slugTouched, setSlugTouched] = useState(
    Boolean(initialValues.slug && initialValues.slug !== slugifyProductName(initialValues.name)),
  );
  const displayedValues = values;

  useEffect(() => {
    if (state.values) setValues(state.values);
  }, [state.values]);

  const updateValue = <K extends keyof ProductFormValues>(
    field: K,
    value: ProductFormValues[K],
  ) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const handleNameChange = (name: string) => {
    const suggestedSlug = !slugTouched ? slugifyProductName(name) : displayedValues.slug;
    setValues((current) => ({ ...current, name, slug: suggestedSlug }));
  };

  const error = (field: string) => state.fieldErrors?.[field];

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
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Name" name="name" value={displayedValues.name} error={error('name')} onChange={handleNameChange} />
        <Field label="Slug" name="slug" value={displayedValues.slug} error={error('slug')} onChange={(slug) => { setSlugTouched(true); updateValue('slug', slug); }} />
        <Field
          label="Price"
          name="price"
          type="text"
          inputMode="decimal"
          value={displayedValues.price}
          error={error('price')}
          hint="Use dollars and up to two decimal places."
          onChange={(price) => updateValue('price', price)}
        />
        <div>
          <label htmlFor="categoryId" className="mb-2 block text-sm font-medium">
            Category
          </label>
          <select
            id="categoryId"
            name="categoryId"
            value={displayedValues.categoryId}
            onChange={(event) => updateValue('categoryId', event.target.value)}
            className="w-full rounded-sm border border-border bg-background px-3 py-3"
            aria-invalid={Boolean(error('categoryId'))}
            aria-describedby={error('categoryId') ? 'categoryId-error' : undefined}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {error('categoryId') ? (
            <p id="categoryId-error" className="mt-2 text-sm text-red-800">
              {error('categoryId')}
            </p>
          ) : null}
        </div>
      </div>
      <div>
        <label htmlFor="description" className="mb-2 block text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={displayedValues.description}
          onChange={(event) => updateValue('description', event.target.value)}
          rows={5}
          className="w-full rounded-sm border border-border bg-background px-3 py-3"
          aria-invalid={Boolean(error('description'))}
        />
        {error('description') ? (
          <p className="mt-2 text-sm text-red-800">{error('description')}</p>
        ) : null}
      </div>
      <div>
        <label htmlFor="imageUrl" className="mb-2 block text-sm font-medium">
          Image URL
        </label>
        <input
          id="imageUrl"
          name="imageUrl"
          value={displayedValues.imageUrl}
          onChange={(event) => updateValue('imageUrl', event.target.value)}
          className="w-full rounded-sm border border-border bg-background px-3 py-3"
          aria-invalid={Boolean(error('imageUrl'))}
          aria-describedby="imageUrl-hint"
        />
        <p id="imageUrl-hint" className="mt-2 text-sm text-muted-foreground">
          Use an existing local path such as /products/placeholder.svg.
        </p>
        {error('imageUrl') ? (
          <p className="mt-2 text-sm text-red-800">{error('imageUrl')}</p>
        ) : null}
        {displayedValues.imageUrl.startsWith('/') && !displayedValues.imageUrl.startsWith('//') ? (
          <div className="relative mt-4 h-32 w-48 overflow-hidden bg-muted">
            <Image src={displayedValues.imageUrl} alt="Product preview" fill className="object-cover" />
          </div>
        ) : null}
      </div>
      <label className="flex items-center gap-3 text-sm font-medium">
        <input
          type="checkbox"
          name="isActive"
          checked={displayedValues.isActive}
          onChange={(event) => updateValue('isActive', event.target.checked)}
          className="size-4 accent-[var(--accent)]"
        />
        Active in the public storefront
      </label>
      {categories.length === 0 ? (
        <p className="text-sm text-red-800">
          Create a category before adding products.
        </p>
      ) : null}
      <SubmitButton>{submitLabel}</SubmitButton>
    </form>
  );
}

function Field({
  label,
  name,
  value,
  error,
  type = 'text',
  inputMode,
  hint,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  error?: string;
  type?: 'text';
  inputMode?: 'decimal';
  hint?: string;
  onChange?: (value: string) => void;
}) {
  const errorId = `${name}-error`;
  return (
    <div>
      <label htmlFor={name} className="mb-2 block text-sm font-medium">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        className="w-full rounded-sm border border-border bg-background px-3 py-3"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
      />
      {hint ? <p className="mt-2 text-sm text-muted-foreground">{hint}</p> : null}
      {error ? (
        <p id={errorId} className="mt-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}
    </div>
  );
}
