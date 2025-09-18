"use client";

import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { 
  Bed,
  Bath,
  Square,
  Users,
  UserCheck,
  Key,
  Globe,
  Loader2
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
  hasKeys: boolean;
  keysLoading: boolean;
  publishToWebsite: boolean;
  websiteLoading: boolean;
  onToggleKeys: () => void;
  onToggleWebsite: () => void;
}

export function PropertySummary({
  listing,
  selectedOwnerIds,
  owners,
  selectedAgentId,
  agents,
  hasKeys,
  keysLoading,
  publishToWebsite,
  websiteLoading,
  onToggleKeys,
  onToggleWebsite,
}: PropertySummaryProps) {
  const isGarageOrSolar = listing.propertyType === "garage" || listing.propertyType === "solar";
  const shouldShowBedsAndBaths = !isGarageOrSolar;
  const areaValue = isGarageOrSolar ? listing.builtSurfaceArea : listing.squareMeter;
  
  return (
    <Card className="col-span-full bg-gradient-to-br from-amber-50/50 to-rose-50/50 border-gradient-to-r border-amber-200/30 shadow-lg">
      <div className="p-6">
        <div className="flex items-center justify-between">
          {/* Left Section - Property Metrics with natural flow */}
          <div className="flex items-center gap-8">
            {/* Bedrooms - only show for non-garage/solar properties */}
            {shouldShowBedsAndBaths && (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-amber-200 to-rose-200">
                  <Bed className="h-5 w-5 text-amber-800" />
                </div>
                <p className="text-lg font-bold text-gray-900">
                  {listing.bedrooms ?? '-'}
                </p>
              </div>
            )}

            {/* Bathrooms - only show for non-garage/solar properties */}
            {shouldShowBedsAndBaths && (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-amber-200 to-rose-200">
                  <Bath className="h-5 w-5 text-amber-800" />
                </div>
                <p className="text-lg font-bold text-gray-900">
                  {listing.bathrooms ? Math.round(listing.bathrooms) : '-'}
                </p>
              </div>
            )}

            {/* Area - use buildSurfaceArea for garage/solar, squareMeter for others */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-amber-200 to-rose-200">
                <Square className="h-5 w-5 text-amber-800" />
              </div>
              <div className="flex items-baseline gap-1">
                <p className="text-lg font-bold text-gray-900">
                  {areaValue ?? '-'}
                </p>
                {areaValue && (
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
                  ? owners.find(o => o.id.toString() === selectedOwnerIds[0])?.name ?? 'Sin asignar'
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
                  ? agents.find(a => a.id === selectedAgentId)?.name ?? 'Sin asignar'
                  : 'Sin asignar'}
              </p>
            </div>
          </div>

          {/* Right Section - Toggle buttons */}
          <div className="flex items-center gap-3">
            {/* Keys toggle button */}
            <Button
              onClick={onToggleKeys}
              disabled={keysLoading}
              size="sm"
              variant="ghost"
              className={`w-10 h-10 rounded-full p-0 transition-all duration-200 ${
                hasKeys 
                  ? "bg-white hover:bg-gray-50 text-black shadow-xl scale-105" 
                  : "bg-transparent hover:bg-gray-50 text-gray-400 shadow-sm"
              }`}
              title={hasKeys ? "Tenemos las llaves" : "No tenemos las llaves"}
            >
              {keysLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Key className="h-4 w-4" />
              )}
            </Button>
            
            {/* Website toggle button */}
            <Button
              onClick={onToggleWebsite}
              disabled={websiteLoading}
              size="sm"
              variant="ghost"
              className={`w-10 h-10 rounded-full p-0 transition-all duration-200 ${
                publishToWebsite 
                  ? "bg-white hover:bg-gray-50 text-black shadow-xl scale-105" 
                  : "bg-transparent hover:bg-gray-50 text-gray-400 shadow-sm"
              }`}
              title={publishToWebsite ? "Publicar en web" : "No publicar en web"}
            >
              {websiteLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Globe className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}