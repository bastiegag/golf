export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="font-semibold tracking-[0.16em] text-foreground">GOLF</p>
        <p>Considered goods for everyday.</p>
        <p>© {new Date().getFullYear()} Golf Goods</p>
      </div>
    </footer>
  );
}
