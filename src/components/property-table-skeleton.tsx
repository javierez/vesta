import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Skeleton } from "~/components/ui/skeleton";

export function PropertyTableSkeleton() {
  return (
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                style={{ width: "100px", minWidth: "100px", maxWidth: "100px" }}
              >
                Imagen
              </TableHead>
              <TableHead
                style={{ width: "250px", minWidth: "250px", maxWidth: "250px" }}
              >
                Propiedad
              </TableHead>
              <TableHead
                style={{ width: "180px", minWidth: "180px", maxWidth: "180px" }}
              >
                Contactos
              </TableHead>
              <TableHead
                style={{ width: "120px", minWidth: "120px", maxWidth: "120px" }}
              >
                Estado
              </TableHead>
              <TableHead
                style={{ width: "150px", minWidth: "150px", maxWidth: "150px" }}
                className="text-right"
              >
                Precio
              </TableHead>
              <TableHead
                style={{ width: "200px", minWidth: "200px", maxWidth: "200px" }}
              >
                Características
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 6 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell
                  className="py-0"
                  style={{
                    width: "100px",
                    minWidth: "100px",
                    maxWidth: "100px",
                  }}
                >
                  <div className="relative h-[48px] w-[72px] overflow-hidden rounded-md">
                    <Skeleton className="h-full w-full" />
                  </div>
                </TableCell>
                <TableCell
                  style={{
                    width: "250px",
                    minWidth: "250px",
                    maxWidth: "250px",
                  }}
                >
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-3/4" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-3 w-16" />
                      <span className="text-xs text-muted-foreground">•</span>
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </TableCell>
                <TableCell
                  style={{
                    width: "180px",
                    minWidth: "180px",
                    maxWidth: "180px",
                  }}
                >
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-3.5 w-3.5 rounded" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-3.5 w-3.5 rounded" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </TableCell>
                <TableCell
                  style={{
                    width: "120px",
                    minWidth: "120px",
                    maxWidth: "120px",
                  }}
                >
                  <Skeleton className="h-6 w-full rounded-full" />
                </TableCell>
                <TableCell
                  className="text-right"
                  style={{
                    width: "150px",
                    minWidth: "150px",
                    maxWidth: "150px",
                  }}
                >
                  <Skeleton className="ml-auto h-4 w-20" />
                </TableCell>
                <TableCell
                  style={{
                    width: "200px",
                    minWidth: "200px",
                    maxWidth: "200px",
                  }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Skeleton className="mr-1 h-4 w-4" />
                      <Skeleton className="h-4 w-4" />
                    </div>
                    <div className="flex items-center">
                      <Skeleton className="mr-1 h-4 w-4" />
                      <Skeleton className="h-4 w-4" />
                    </div>
                    <div className="flex items-center">
                      <Skeleton className="mr-1 h-4 w-4" />
                      <Skeleton className="h-4 w-6" />
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
