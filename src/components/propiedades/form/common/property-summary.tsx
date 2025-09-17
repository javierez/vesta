"use client";

import { useState, useEffect } from "react";
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
import { toggleListingKeysWithAuth, toggleListingPublishToWebsiteWithAuth, getListingDetailsWithAuth } from "~/server/queries/listing";

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
  listingId: bigint;
}

export function PropertySummary({
  listing,
  selectedOwnerIds,
  owners,
  selectedAgentId,
  agents,
  listingId,
}: PropertySummaryProps) {
  const [hasKeys, setHasKeys] = useState<boolean>(false);
  const [keysLoading, setKeysLoading] = useState(false);
  const [publishToWebsite, setPublishToWebsite] = useState<boolean>(false);
  const [websiteLoading, setWebsiteLoading] = useState(false);

  // Fetch initial hasKeys value
  useEffect(() => {
    const fetchHasKeys = async () => {
      try {
        const listingDetails = await getListingDetailsWithAuth(Number(listingId));
        setHasKeys((listingDetails as { hasKeys?: boolean }).hasKeys ?? false);
      } catch (error) {
        console.error('Error fetching hasKeys value:', error);
        setHasKeys(false); // Default to false if error
      }
    };
    
    void fetchHasKeys();
  }, [listingId]);

  // Fetch initial publishToWebsite value
  useEffect(() => {
    const fetchPublishToWebsite = async () => {
      try {
        const listingDetails = await getListingDetailsWithAuth(Number(listingId));
        setPublishToWebsite((listingDetails as { publishToWebsite?: boolean }).publishToWebsite ?? false);
      } catch (error) {
        console.error('Error fetching publishToWebsite value:', error);
        setPublishToWebsite(false); // Default to false if error
      }
    };
    
    void fetchPublishToWebsite();
  }, [listingId]);

  const handleToggleKeys = async () => {
    if (keysLoading) return;
    
    setKeysLoading(true);
    const previousValue = hasKeys;
    
    // Optimistic update
    setHasKeys(!hasKeys);
    
    try {
      const result = await toggleListingKeysWithAuth(Number(listingId));
      setHasKeys(result.hasKeys);
    } catch (error) {
      console.error('Error toggling keys:', error);
      // Revert optimistic update on error
      setHasKeys(previousValue);
    } finally {
      setKeysLoading(false);
    }
  };

  const handleToggleWebsite = async () => {
    if (websiteLoading) return;
    
    setWebsiteLoading(true);
    const previousValue = publishToWebsite;
    
    // Optimistic update
    setPublishToWebsite(!publishToWebsite);
    
    try {
      const result = await toggleListingPublishToWebsiteWithAuth(Number(listingId));
      setPublishToWebsite(result.publishToWebsite);
    } catch (error) {
      console.error('Error toggling publishToWebsite:', error);
      // Revert optimistic update on error
      setPublishToWebsite(previousValue);
    } finally {
      setWebsiteLoading(false);
    }
  };
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

          {/* Right Section - Toggle buttons */}
          <div className="flex items-center gap-3">
            {/* Keys toggle button */}
            <Button
              onClick={handleToggleKeys}
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
              onClick={handleToggleWebsite}
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