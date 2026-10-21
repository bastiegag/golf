import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-5 sm:px-8">
      <section className="grid min-h-[min(720px,calc(100svh-5rem))] items-center gap-12 py-16 lg:grid-cols-[1fr_0.9fr] lg:gap-20 lg:py-20">
        <div className="max-w-2xl">
          <p className="mb-6 text-xs font-semibold tracking-[0.24em] text-muted-foreground uppercase">
            A little less, a little better
          </p>
          <h1 className="max-w-xl text-5xl leading-[1.06] font-medium tracking-[-0.055em] sm:text-7xl">
            Good things, made to be kept.
          </h1>
          <p className="mt-7 max-w-lg text-lg leading-8 text-muted-foreground">
            Thoughtful essentials for your everyday rituals. Made with care,
            chosen to last, and ready to become part of your story.
          </p>
          <Button asChild className="mt-9">
            <Link href="/products">
              Explore the collection <ArrowRight aria-hidden="true" size={17} />
            </Link>
          </Button>
          <p className="mt-8 text-sm text-muted-foreground">
            Useful by nature. Considered by design.
          </p>
        </div>
        <div
          aria-hidden="true"
          className="relative flex aspect-[0.94] items-center justify-center overflow-hidden rounded-sm bg-[#e9e5dc]"
        >
          <div className="absolute -top-20 -right-12 h-64 w-64 rounded-full bg-[#d9d5ca]" />
          <div className="absolute -bottom-24 -left-12 h-72 w-72 rounded-full bg-[#d4dbd1]" />
          <div className="relative flex h-[68%] w-[53%] items-center justify-center rounded-[48%_48%_10%_10%] bg-[#8b9a8a] shadow-[0_25px_70px_rgba(45,57,47,0.14)]">
            <div className="absolute top-[24%] h-[52%] w-[48%] rounded-[48%_48%_8%_8%] border border-white/30" />
            <span className="relative mt-7 text-[10px] tracking-[0.22em] text-white/80 uppercase">
              Made for daily life
            </span>
          </div>
          <p className="absolute right-5 bottom-5 text-xs tracking-[0.18em] text-foreground/60 uppercase">
            Everyday, elevated
          </p>
        </div>
      </section>
      <section className="flex flex-col gap-3 border-t border-border py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>Objects with purpose. Materials with a point of view.</p>
        <Link
          href="/products"
          className="inline-flex w-fit items-center gap-2 font-medium text-foreground hover:text-accent"
        >
          Browse all products <ArrowRight aria-hidden="true" size={15} />
        </Link>
      </section>
    </div>
  );
}
