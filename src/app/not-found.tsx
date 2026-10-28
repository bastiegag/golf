import { EmptyState } from '@/components/ui/empty-state';
import { Container } from '@/components/layout/container';

export default function NotFound() {
  return (
    <Container className="py-24 sm:py-32">
      <EmptyState
        title="Page not found"
        description="The page you are looking for does not exist or is no longer available."
      />
    </Container>
  );
}
