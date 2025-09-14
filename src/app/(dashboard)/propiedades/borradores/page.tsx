"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getDraftListingsWithAuth,
  deleteDraftListingWithAuth,
} from "~/server/queries/listing";
import { Card, CardContent } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { FileText, MapPin, ChevronRight, Trash2 } from "lucide-react";
import BorradoresSkeleton from "~/components/borradores/borradores_skeleton";

interface DraftListing {
  listingId: bigint;
  street: string | null;
  city: string | null;
  title: string | null;
}

export default function BorradoresPage() {
  const router = useRouter();
  const [draftListings, setDraftListings] = useState<DraftListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<bigint | null>(null);

  useEffect(() => {
    const fetchDraftListings = async () => {
      try {
        setLoading(true);
        const listings = await getDraftListingsWithAuth();
        setDraftListings(listings);
      } catch (err) {
        console.error("Error fetching draft listings:", err);
        setError("Error al cargar los borradores");
      } finally {
        setLoading(false);
      }
    };

    void fetchDraftListings(); // Mark promise as intentionally unhandled
  }, []);

  const handleRowClick = (listingId: bigint) => {
    router.push(`/propiedades/crear/${listingId.toString()}`);
  };

  const handleDelete = async (listingId: bigint, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click when clicking delete button

    if (
      !confirm(
        "¿Estás seguro de que quieres eliminar este borrador? Esta acción no se puede deshacer.",
      )
    ) {
      return;
    }

    try {
      setDeletingId(listingId);
      await deleteDraftListingWithAuth(Number(listingId));

      // Remove the deleted draft from the local state
      setDraftListings((prev) =>
        prev.filter((draft) => draft.listingId !== listingId),
      );
    } catch (err) {
      console.error("Error deleting draft:", err);
      alert("Error al eliminar el borrador");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <BorradoresSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="py-4" aria-label="Breadcrumb">
        <ol className="flex items-center text-sm">
          <li>
            <Link
              href="/propiedades"
              className="text-muted-foreground hover:text-primary"
            >
              Propiedades
            </Link>
          </li>
          <li className="mx-2">/</li>
          <li className="font-medium" aria-current="page">
            Borradores
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-2xl font-semibold text-gray-900">
          Borradores
        </h1>
      </div>

      {/* Listings Table */}
      {draftListings.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="py-12 text-center">
              <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                No hay borradores
              </h3>
              <p className="text-gray-600">
                No se encontraron propiedades en estado borrador.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dirección</TableHead>
                  <TableHead>Ciudad</TableHead>
                  <TableHead className="w-[100px]">Estado</TableHead>
                  <TableHead className="w-[100px]">Acciones</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {draftListings.map((listing) => (
                  <TableRow
                    key={listing.listingId.toString()}
                    className="cursor-pointer transition-colors hover:bg-gray-50"
                    onClick={() => handleRowClick(listing.listingId)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">
                          {listing.street ?? listing.title ?? "Sin dirección"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-600">
                        {listing.city ?? "Sin ciudad"}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className="border-orange-200 text-orange-600"
                      >
                        Borrador
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => handleDelete(listing.listingId, e)}
                        disabled={deletingId === listing.listingId}
                        className="border-red-200 bg-transparent text-red-600 shadow-none hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
