import Link from 'next/link';
import { StatusButton } from './status-button';

type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  updatedAt: Date;
  _count: { products: number };
};

export function CategoryTable({ categories }: { categories: AdminCategory[] }) {
  return (
    <div className="overflow-x-auto rounded-sm border border-border">
      <table className="w-full min-w-[700px] text-left text-sm">
        <caption className="sr-only">Managed categories</caption>
        <thead className="bg-muted text-xs tracking-wide text-muted-foreground uppercase">
          <tr>
            <th scope="col" className="px-4 py-3">Category</th>
            <th scope="col" className="px-4 py-3">Products</th>
            <th scope="col" className="px-4 py-3">Status</th>
            <th scope="col" className="px-4 py-3">Updated</th>
            <th scope="col" className="px-4 py-3"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {categories.map((category) => (
            <tr key={category.id}>
              <td className="px-4 py-4">
                <p className="font-medium">{category.name}</p>
                <p className="text-muted-foreground">{category.slug}</p>
              </td>
              <td className="px-4 py-4">
                <Link
                  href={`/admin/products?categoryId=${encodeURIComponent(category.id)}`}
                  className="underline underline-offset-4"
                >
                  {category._count.products}
                </Link>
              </td>
              <td className="px-4 py-4">
                <span className={category.isActive ? 'text-success' : 'text-muted-foreground'}>
                  {category.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-4 py-4">{category.updatedAt.toLocaleDateString()}</td>
              <td className="px-4 py-4">
                <div className="flex items-center justify-end gap-3">
                  <Link href={`/admin/categories/${category.id}/edit`} className="font-medium underline underline-offset-4">
                    Edit
                  </Link>
                  <StatusButton
                    id={category.id}
                    isActive={category.isActive}
                    productCount={category._count.products}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
