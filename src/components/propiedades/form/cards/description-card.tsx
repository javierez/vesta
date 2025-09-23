"use client";

import React from "react";
import { Card } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { Loader2, MoreVertical } from "lucide-react";
import { Textarea } from "~/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { ModernSaveIndicator } from "../common/modern-save-indicator";
import type { SaveState } from "~/types/save-state";

interface DescriptionCardProps {
  description: string;
  shortDescription: string;
  isGenerating: boolean;
  isGeneratingShort: boolean;
  signature: string;
  isSignatureDialogOpen: boolean;
  saveState: SaveState;
  onSave: () => Promise<void>;
  onUpdateModule: (hasChanges: boolean) => void;
  onGenerateDescription: () => Promise<void>;
  onGenerateShortDescription: () => Promise<void>;
  setSignature: (value: string) => void;
  setIsSignatureDialogOpen: (value: boolean) => void;
  setDescription: (value: string) => void;
  setShortDescription: (value: string) => void;
  getCardStyles: (moduleName: string) => string;
}

export function DescriptionCard({
  description,
  shortDescription,
  isGenerating,
  isGeneratingShort,
  signature,
  isSignatureDialogOpen,
  saveState,
  onSave,
  onUpdateModule,
  onGenerateDescription,
  onGenerateShortDescription,
  setSignature,
  setIsSignatureDialogOpen,
  setDescription,
  setShortDescription,
  getCardStyles,
}: DescriptionCardProps) {
  const handleSignatureChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSignature(e.target.value);
    onUpdateModule(true);
  };

  return (
    <>
      <Card
        className={cn(
          "relative col-span-full p-4 transition-all duration-500 ease-out",
          getCardStyles("description"),
        )}
      >
        <ModernSaveIndicator
          state={saveState}
          onSave={onSave}
        />
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-wide">DESCRIPCIÓN</h3>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsSignatureDialogOpen(true)}>
                Añadir Firma
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="space-y-6">
          {/* Short Description Section */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="shortDescription" className="text-sm">
                Descripción Corta
              </Label>
              <div className="group relative">
                <Textarea
                  id="shortDescription"
                  defaultValue={shortDescription}
                  className="min-h-[80px] resize-y border-gray-200 transition-colors focus:border-gray-400 focus:ring-gray-300 pr-32"
                  placeholder="Breve resumen de la propiedad para carteles y vistas previas (máximo 200 caracteres)"
                  maxLength={200}
                  onChange={(e) => {
                    setShortDescription(e.target.value);
                    onUpdateModule(true);
                  }}
                />
                <button
                  type="button"
                  onClick={onGenerateShortDescription}
                  disabled={isGeneratingShort}
                  className="absolute bottom-2 right-2 h-8 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-gradient-to-r from-amber-400 to-rose-400 px-2 text-xs font-medium text-white rounded shadow-sm hover:from-amber-500 hover:to-rose-500 hover:shadow-md disabled:opacity-50 flex items-center"
                >
                  {isGeneratingShort ? (
                    <>
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    "Generar descripción corta"
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* Full Description Section */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-sm">
                Descripción Completa
              </Label>
              <div className="group relative">
                <Textarea
                  id="description"
                  defaultValue={description}
                  className="min-h-[200px] resize-y border-gray-200 transition-colors focus:border-gray-400 focus:ring-gray-300 pr-32"
                  placeholder="Describe las características principales de la propiedad, su ubicación, y cualquier detalle relevante que pueda interesar a los potenciales compradores o inquilinos."
                  onChange={(e) => {
                    setDescription(e.target.value);
                    onUpdateModule(true);
                  }}
                />
                <button
                  type="button"
                  onClick={onGenerateDescription}
                  disabled={isGenerating}
                  className="absolute bottom-2 right-2 h-8 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-gradient-to-r from-amber-400 to-rose-400 px-2 text-xs font-medium text-white rounded shadow-sm hover:from-amber-500 hover:to-rose-500 hover:shadow-md disabled:opacity-50 flex items-center"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    "Generar descripción completa"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Dialog
        open={isSignatureDialogOpen}
        onOpenChange={setIsSignatureDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Añadir Firma</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Escribe tu firma aquí..."
              value={signature}
              onChange={handleSignatureChange}
              className="min-h-[100px] resize-y"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSignatureDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                // Here you can add logic to append the signature to the description
                const descriptionTextarea = document.getElementById(
                  "description",
                ) as HTMLTextAreaElement;
                if (descriptionTextarea) {
                  descriptionTextarea.value =
                    descriptionTextarea.value + "\n\n" + signature;
                  setDescription(descriptionTextarea.value);
                  onUpdateModule(true);
                }
                setIsSignatureDialogOpen(false);
              }}
            >
              Añadir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}