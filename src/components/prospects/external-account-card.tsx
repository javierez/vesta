"use client";

import React from "react";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Lock, MessageCircle } from "lucide-react";
import type { ProspectMatch } from "~/types/connection-matches";

interface ExternalAccountCardProps {
  accountId: string;
  matches: ProspectMatch[];
  onRequestContact?: (accountId: string, matches: ProspectMatch[]) => void;
}

export const ExternalAccountCard = React.memo(function ExternalAccountCard({
  accountId,
  matches,
  onRequestContact,
}: ExternalAccountCardProps) {
  const listingsCount = matches.length;
  
  const handleRequestContact = () => {
    if (onRequestContact) {
      onRequestContact(accountId, matches);
    }
  };

  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-all">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
              <Lock className="h-5 w-5 text-gray-500" />
            </div>
            <div>
              <p className="font-medium text-gray-900">
                Agencia Colaboradora
              </p>
              <p className="text-sm text-gray-600">
                {listingsCount} propiedad{listingsCount !== 1 ? 'es' : ''} que coincide{listingsCount === 1 ? '' : 'n'} con tu búsqueda
              </p>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRequestContact}
            className="flex items-center space-x-2 hover:bg-gray-50"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Solicitar contacto</span>
          </Button>
        </div>
        
        {matches.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex flex-wrap gap-2">
              {matches.slice(0, 3).map((match, index) => (
                <div key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                  €{new Intl.NumberFormat('es-ES').format(parseFloat(match.listing.listings.price))}
                  {match.listing.properties.bedrooms && ` • ${match.listing.properties.bedrooms} hab`}
                  {match.listing.properties.bathrooms && ` • ${match.listing.properties.bathrooms} baños`}
                  {match.listing.properties.squareMeter && ` • ${match.listing.properties.squareMeter}m²`}
                </div>
              ))}
              {matches.length > 3 && (
                <div className="text-xs text-gray-500 px-2 py-1">
                  +{matches.length - 3} más
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});