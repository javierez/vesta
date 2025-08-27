import React from "react";
import { PropertyCard } from "~/components/property-card";
import { PaginationControls } from "~/components/ui/pagination-controls";
import type { ListingOverview } from "~/types/listing";

interface PropertyGridProps {
  listings: ListingOverview[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  accountWebsite?: string | null;
}

export const PropertyGrid = React.memo(function PropertyGrid({
  listings,
  currentPage,
  totalPages,
  onPageChange,
  accountWebsite,
}: PropertyGridProps) {
  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing) => (
          <PropertyCard
            key={listing.listingId.toString()}
            listing={listing}
            accountWebsite={accountWebsite}
          />
        ))}
      </div>
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        className="mt-10"
      />
    </>
  );
});
