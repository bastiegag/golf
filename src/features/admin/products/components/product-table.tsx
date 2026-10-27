import Image from 'next/image';
import Link from 'next/link';
import { StatusButton } from './status-button';
import { formatPrice } from '@/features/products/utils/format-price';

type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  price: string;
  imageUrl: string;
  isActive: boolean;
  updatedAt: Date;
  category: { name: string; isActive: boolean };
};

export function ProductTable({ products }: { products: AdminProduct[] }) {
  return (
    <div className="overflow-x-auto rounded-sm border border-border">
      <table className="w-full min-w-[780px] text-left text-sm">
        <caption className="sr-only">Managed products</caption>
        <thead className="bg-muted text-xs tracking-wide text-muted-foreground uppercase">
          <tr>
            <th scope="col" className="px-4 py-3">Product</th>
            <th scope="col" className="px-4 py-3">Category</th>
            <th scope="col" className="px-4 py-3">Price</th>
            <th scope="col" className="px-4 py-3">Status</th>
            <th scope="col" className="px-4 py-3">Updated</th>
            <th scope="col" className="px-4 py-3"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {products.map((product) => (
            <tr key={product.id}>
              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <Image src={product.imageUrl} alt="" width={56} height={42} className="h-10 w-14 object-cover" />
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-muted-foreground">{product.slug}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4">
                {product.category.name}
                {!product.category.isActive ? ' (inactive)' : ''}
              </td>
              <td className="px-4 py-4">{formatPrice(product.price)}</td>
              <td className="px-4 py-4">
                <span className={product.isActive ? 'text-green-800' : 'text-muted-foreground'}>
                  {product.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-4 py-4">{product.updatedAt.toLocaleDateString()}</td>
              <td className="px-4 py-4">
                <div className="flex items-center justify-end gap-3">
                  <Link href={`/admin/products/${product.id}/edit`} className="font-medium underline underline-offset-4">
                    Edit
                  </Link>
                  <StatusButton id={product.id} isActive={product.isActive} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
