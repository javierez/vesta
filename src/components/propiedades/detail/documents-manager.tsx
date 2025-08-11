"use client";

import React from "react";
import { Card, CardContent } from "~/components/ui/card";
import { useRouter } from "next/navigation";
import { FolderIcon } from "lucide-react";
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
      name: "Documentación Inicial",
      description: "Hoja de encargo, valoración, etc.",
      documents: []
    },
    {
      id: "visitas",
      name: "Visitas",
      description: "Reportes de visitas.",
      documents: []
    },
    {
      id: "otros",
      name: "Otros",
      description: "Otros documentos",
      documents: []
    }
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {folders.map((folder) => (
          <Card 
            key={folder.id} 
            className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
            onClick={() => handleFolderClick(folder.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <FolderIcon className="h-8 w-8 text-gray-600 fill-current" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">
                    {folder.name}
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {folder.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}