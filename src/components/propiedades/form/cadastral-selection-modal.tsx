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
  // Extract common information from the first result (all units share the same building info)
  const commonInfo = searchResults.length > 0 ? {
    street: searchResults[0]?.street ?? "",
    municipality: searchResults[0]?.municipality ?? "",
    province: searchResults[0]?.province ?? "",
    yearBuilt: searchResults[0]?.yearBuilt ?? 0,
  } : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] sm:w-full max-h-[90vh] sm:max-h-[80vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="space-y-2 sm:space-y-3">
          <DialogTitle className="text-lg sm:text-xl">Seleccionar Propiedad en Catastro</DialogTitle>
          <DialogDescription className="text-sm">
            Se encontraron {searchResults.length} {searchResults.length === 1 ? 'unidad' : 'unidades'} en esta dirección.
            Selecciona la unidad específica de tu propiedad.
          </DialogDescription>
        </DialogHeader>

        {/* Common information header */}
        {commonInfo && searchResults.length > 0 && (
          <div className="bg-muted/50 rounded-lg p-3 sm:p-4 space-y-2 mb-3 sm:mb-4">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm sm:text-base break-words">{commonInfo.street}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  {commonInfo.municipality}, {commonInfo.province}
                </div>
              </div>
            </div>
            {commonInfo.yearBuilt > 0 && (
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">Año de construcción:</span>
                <span className="font-medium">{commonInfo.yearBuilt}</span>
              </div>
            )}
          </div>
        )}

        <div className="space-y-3 sm:space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8 sm:py-12">
              <Loader className="h-8 w-8 sm:h-10 sm:w-10 animate-spin mb-3" />
              <span className="text-sm sm:text-base text-muted-foreground">Buscando referencias catastrales...</span>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-8 sm:py-12 px-4">
              <MapPin className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium mb-2">No se encontraron referencias</h3>
              <p className="text-sm text-muted-foreground">
                No se encontraron referencias catastrales para esta dirección.
                Verifica que los datos sean correctos.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
              {searchResults.map((result, index) => (
                <Card
                  key={index}
                  className="cursor-pointer hover:shadow-md hover:border-primary transition-all"
                  onClick={() => onSelect(result)}
                >
                  <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
                    <div className="flex items-start justify-between gap-2 sm:gap-4">
                      <div className="space-y-1 flex-1 min-w-0">
                        <CardTitle className="text-base sm:text-lg font-semibold break-words">
                          {result.addressDetails || `Unidad ${index + 1}`}
                        </CardTitle>
                        <div className="text-xs text-muted-foreground font-mono break-all">
                          {result.cadastralReference}
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0 space-y-2 sm:space-y-3 p-3 sm:p-6">
                    {/* Surface Area */}
                    <div className="flex items-center justify-between py-2 border-b">
                      <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground">
                        <Square className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="text-xs sm:text-sm">Superficie</span>
                      </div>
                      <div className="text-xs sm:text-sm font-medium">
                        {result.builtSurfaceArea > 0
                          ? `${result.builtSurfaceArea} m²`
                          : <span className="text-muted-foreground">No disponible</span>
                        }
                      </div>
                    </div>

                    {/* Postal Code */}
                    {result.postalCode && (
                      <div className="flex items-center justify-between py-2 border-b">
                        <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span className="text-xs sm:text-sm">Código Postal</span>
                        </div>
                        <div className="text-xs sm:text-sm font-medium">
                          {result.postalCode}
                        </div>
                      </div>
                    )}

                    <Button
                      size="sm"
                      className="w-full mt-2 text-xs sm:text-sm h-8 sm:h-9"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(result);
                      }}
                    >
                      Seleccionar esta unidad
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-3 sm:pt-4 border-t mt-3 sm:mt-4">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs sm:text-sm">
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
