export function PropertyMapSkeleton() {
  return (
    <div className="h-[600px] w-full animate-pulse rounded-lg border border-border bg-muted/20">
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Cargando mapa...</p>
        </div>
      </div>
    </div>
  );
}
