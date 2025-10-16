"use client";

import React from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Loader, MapPin, Calendar, Square } from "lucide-react";

interface CadastralSearchResult {
  cadastralReference: string;
  street: string;
  addressDetails: string;
  postalCode: string;
  city?: string;
  province?: string;
  municipality: string;
  builtSurfaceArea: number;
  yearBuilt: number;
}

interface CadastralSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchResults: CadastralSearchResult[];
  isLoading: boolean;
  onSelect: (result: CadastralSearchResult) => void;
}

export function CadastralSelectionModal({
  isOpen,
  onClose,
  searchResults,
  isLoading,
  onSelect,
}: CadastralSelectionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Seleccionar Referencia Catastral</DialogTitle>
          <DialogDescription>
            Se encontraron {searchResults.length} posibles referencias catastrales. 
            Selecciona la que mejor coincida con tu propiedad.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="h-6 w-6 animate-spin mr-2" />
              <span className="text-muted-foreground">Buscando referencias catastrales...</span>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No se encontraron referencias</h3>
              <p className="text-muted-foreground">
                No se encontraron referencias catastrales para esta dirección. 
                Verifica que los datos sean correctos.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {searchResults.map((result, index) => (
                <Card 
                  key={index} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onSelect(result)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-base font-medium">
                          {result.street}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {result.addressDetails}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">
                          Ref. Catastral
                        </div>
                        <div className="text-xs font-mono">
                          {result.cadastralReference}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span className="text-xs">Ubicación</span>
                        </div>
                        <div className="text-xs">
                          <div>{result.postalCode} {result.city}</div>
                          <div>{result.province}</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center text-muted-foreground">
                          <Square className="h-4 w-4 mr-2" />
                          <span className="text-xs">Superficie</span>
                        </div>
                        <div className="text-xs">
                          {result.builtSurfaceArea > 0 
                            ? `${result.builtSurfaceArea} m²`
                            : "No disponible"
                          }
                        </div>
                      </div>
                    </div>
                    
                    {result.yearBuilt > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex items-center text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span className="text-xs">Año construcción</span>
                        </div>
                        <div className="text-xs mt-1">
                          {result.yearBuilt}
                        </div>
                      </div>
                    )}
                    
                    <Button 
                      size="sm" 
                      className="w-full mt-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(result);
                      }}
                    >
                      Seleccionar
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
