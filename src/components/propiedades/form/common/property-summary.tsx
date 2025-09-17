"use client";

import { Card } from "~/components/ui/card";
import { 
  Bed,
  Bath,
  Square,
  Users,
  UserCheck
} from "lucide-react";

import type { PropertyListing } from "~/types/property-listing";

interface Agent {
  id: string;
  name: string;
}

interface Owner {
  id: number;
  name: string;
}

interface PropertySummaryProps {
  listing: PropertyListing;
  selectedOwnerIds: string[];
  owners: Owner[];
  selectedAgentId: string;
  agents: Agent[];
}

export function PropertySummary({
  listing,
  selectedOwnerIds,
  owners,
  selectedAgentId,
  agents,
}: PropertySummaryProps) {
  return (
    <Card className="col-span-full bg-gradient-to-br from-amber-50/50 to-rose-50/50 border-gradient-to-r border-amber-200/30 shadow-lg">
      <div className="p-6">
        <div className="flex items-center justify-between">
          {/* Left Section - Property Metrics with natural flow */}
          <div className="flex items-center gap-8">
            {/* Bedrooms */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-amber-200 to-rose-200">
                <Bed className="h-5 w-5 text-amber-800" />
              </div>
              <p className="text-lg font-bold text-gray-900">
                {listing.bedrooms || '-'}
              </p>
            </div>

            {/* Bathrooms */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-amber-200 to-rose-200">
                <Bath className="h-5 w-5 text-amber-800" />
              </div>
              <p className="text-lg font-bold text-gray-900">
                {listing.bathrooms ? Math.round(listing.bathrooms) : '-'}
              </p>
            </div>

            {/* Square Meters */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-amber-200 to-rose-200">
                <Square className="h-5 w-5 text-amber-800" />
              </div>
              <div className="flex items-baseline gap-1">
                <p className="text-lg font-bold text-gray-900">
                  {listing.squareMeter || '-'}
                </p>
                {listing.squareMeter && (
                  <p className="text-xs text-gray-500">m²</p>
                )}
              </div>
            </div>
          </div>

          {/* Center Section - Owner and Agent */}
          <div className="flex items-center gap-4">
            {/* Owner */}
            <div className="flex items-center gap-2 bg-white/70 rounded-lg px-3 py-2 shadow-sm">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-amber-200 to-rose-200">
                <Users className="h-3 w-3 text-amber-800" />
              </div>
              <p className="text-sm font-medium text-gray-900 truncate max-w-24">
                {selectedOwnerIds.length > 0 
                  ? owners.find(o => o.id.toString() === selectedOwnerIds[0])?.name || 'Sin asignar'
                  : 'Sin asignar'}
              </p>
            </div>

            {/* Agent */}
            <div className="flex items-center gap-2 bg-white/70 rounded-lg px-3 py-2 shadow-sm">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-amber-200 to-rose-200">
                <UserCheck className="h-3 w-3 text-amber-800" />
              </div>
              <p className="text-sm font-medium text-gray-900 truncate max-w-24">
                {selectedAgentId 
                  ? agents.find(a => a.id === selectedAgentId)?.name || 'Sin asignar'
                  : 'Sin asignar'}
              </p>
            </div>
          </div>

          {/* Right Section - Waiting for instructions */}
          <div className="flex items-center">
            {/* Placeholder for future content */}
          </div>
        </div>
      </div>
    </Card>
  );
}