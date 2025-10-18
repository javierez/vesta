"use client";

import React from "react";
import { Card, CardContent } from "~/components/ui/card";
import { useRouter } from "next/navigation";
import { FolderIcon, ZapIcon } from "lucide-react";
import { cn } from "~/lib/utils";

interface Document {
  id: string;
  name: string;
  url: string;
}

interface Folder {
  id: string;
  name: string;
  description?: string;
  documents: Document[];
}

interface DocumentsManagerProps {
  propertyId: bigint;
  listingId: bigint;
  referenceNumber: string;
  className?: string;
}

export function DocumentsManager({
  propertyId: _propertyId,
  listingId,
  referenceNumber: _referenceNumber,
  className = "",
}: DocumentsManagerProps) {
  const router = useRouter();

  // Folder configurations - these would be fetched from API in a real implementation
  const folders: Folder[] = [
    {
      id: "documentacion-inicial",
      name: "Inicial",
      description: "Hoja de encargo, valoración.",
      documents: [],
    },
    {
      id: "visitas",
      name: "Visitas",
      description: "Reportes de visitas.",
      documents: [],
    },
    {
      id: "planos",
      name: "Planos",
      description: "Planos de la propiedad",
      documents: [],
    },
    {
      id: "certificado-energetico",
      name: "Cert. Energético",
      description: "Certificado y consumos",
      documents: [],
    },
    {
      id: "otros",
      name: "Otros",
      description: "Otros documentos",
      documents: [],
    },
  ];

  const handleFolderClick = (folderId: string) => {
    router.push(`/propiedades/${listingId}/${folderId}`);
  };

  // Show folders view
  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Documentos</h3>
        <p className="text-sm text-gray-500">
          Gestiona los documentos de la propiedad
        </p>
      </div>

      {/* Folders grid */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        {folders.map((folder) => {
          const isEnergyFolder = folder.id === "certificado-energetico";
          return (
            <Card
              key={folder.id}
              className="cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-md relative"
              onClick={() => handleFolderClick(folder.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <FolderIcon className="h-6 w-6 fill-current text-gray-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate font-medium text-gray-900 text-sm">
                      {folder.name}
                    </h4>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {folder.description}
                    </p>
                  </div>
                </div>
                {isEnergyFolder && (
                  <ZapIcon className="absolute top-2 right-2 h-3.5 w-3.5 text-green-600 opacity-60 fill-current" />
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
