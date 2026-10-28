'use client';

import Image from 'next/image';
import { useActionState, useEffect, useState } from 'react';
import type { ProductActionState, ProductFormValues } from '../actions';
import { slugifyProductName } from '../schemas';
import { SubmitButton } from './submit-button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

type Category = { id: string; name: string; isActive?: boolean };

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
  const [previewFailed, setPreviewFailed] = useState(false);
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

  const handleImageUrlChange = (imageUrl: string) => {
    setPreviewFailed(false);
    updateValue('imageUrl', imageUrl);
  };

  const error = (field: string) => state.fieldErrors?.[field];

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
      <div className="grid gap-6 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <Input
            id="name"
            name="name"
            value={displayedValues.name}
            onChange={(event) => handleNameChange(event.target.value)}
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
            value={displayedValues.slug}
            onChange={(event) => {
              setSlugTouched(true);
              updateValue('slug', event.target.value);
            }}
            aria-invalid={Boolean(error('slug'))}
            aria-describedby={error('slug') ? 'slug-error' : undefined}
          />
          <FieldError id="slug-error">{error('slug')}</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="price">Price</FieldLabel>
          <Input
            id="price"
            name="price"
            type="text"
            inputMode="decimal"
            value={displayedValues.price}
            onChange={(event) => updateValue('price', event.target.value)}
            aria-invalid={Boolean(error('price'))}
            aria-describedby="price-hint"
          />
          <FieldDescription id="price-hint">
            Use dollars and up to two decimal places.
          </FieldDescription>
          <FieldError id="price-error">{error('price')}</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="categoryId">Category</FieldLabel>
          <Select
            id="categoryId"
            name="categoryId"
            value={displayedValues.categoryId}
            onChange={(event) => updateValue('categoryId', event.target.value)}
            aria-invalid={Boolean(error('categoryId'))}
            aria-describedby={error('categoryId') ? 'categoryId-error' : undefined}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option
                key={category.id}
                value={category.id}
                disabled={
                  category.isActive === false &&
                  category.id !== displayedValues.categoryId
                }
              >
                {category.name}{category.isActive === false ? ' (inactive)' : ''}
              </option>
            ))}
          </Select>
          <FieldError id="categoryId-error">{error('categoryId')}</FieldError>
        </Field>
      </div>
      <Field>
        <FieldLabel htmlFor="description">Description</FieldLabel>
        <Textarea
          id="description"
          name="description"
          value={displayedValues.description}
          onChange={(event) => updateValue('description', event.target.value)}
          rows={5}
          aria-invalid={Boolean(error('description'))}
          aria-describedby={error('description') ? 'description-error' : undefined}
        />
        <FieldError id="description-error">{error('description')}</FieldError>
      </Field>
      <Field>
        <FieldLabel htmlFor="imageUrl">Image URL</FieldLabel>
        <Input
          id="imageUrl"
          name="imageUrl"
          value={displayedValues.imageUrl}
          onChange={(event) => handleImageUrlChange(event.target.value)}
          aria-invalid={Boolean(error('imageUrl'))}
          aria-describedby={`imageUrl-hint${error('imageUrl') ? ' imageUrl-error' : ''}`}
        />
        <FieldDescription id="imageUrl-hint">
          Use an existing local path such as /products/placeholder.svg.
        </FieldDescription>
        <FieldError id="imageUrl-error">{error('imageUrl')}</FieldError>
        {!previewFailed &&
        displayedValues.imageUrl.startsWith('/') &&
        !displayedValues.imageUrl.startsWith('//') ? (
          <div className="relative mt-4 h-32 w-48 overflow-hidden bg-muted">
            <Image
              src={displayedValues.imageUrl}
              alt="Product preview"
              fill
              className="object-cover"
              onError={() => setPreviewFailed(true)}
            />
          </div>
        ) : null}
      </Field>
      <FieldLabel className="flex items-center gap-3">
        <Checkbox
          name="isActive"
          checked={displayedValues.isActive}
          onChange={(event) => updateValue('isActive', event.target.checked)}
        />
        Active in the public storefront
      </FieldLabel>
      {categories.length === 0 ? (
        <p className="text-body-sm text-destructive">
          Create a category before adding products.
        </p>
      ) : null}
      <SubmitButton>{submitLabel}</SubmitButton>
    </form>
  );
}
