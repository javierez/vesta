"use client";

import { useState } from "react";
import { Plus, ExternalLink, Edit, Trash2, Glasses } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { cn } from "~/lib/utils";

interface VirtualTour {
  id: string;
  title: string;
  url: string;
  description?: string;
}

interface VirtualTourManagerProps {
  propertyId: bigint;
  referenceNumber: string;
}

export function VirtualTourManager({
  propertyId,
  referenceNumber,
}: VirtualTourManagerProps) {
  const [tours, setTours] = useState<VirtualTour[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTour, setEditingTour] = useState<VirtualTour | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    description: "",
  });

  const handleAddTour = () => {
    if (!formData.title || !formData.url) return;

    const newTour: VirtualTour = {
      id: Date.now().toString(),
      title: formData.title,
      url: formData.url,
      description: formData.description,
    };

    setTours((prev) => [...prev, newTour]);
    setFormData({ title: "", url: "", description: "" });
    setIsAddDialogOpen(false);
  };

  const handleEditTour = (tour: VirtualTour) => {
    setEditingTour(tour);
    setFormData({
      title: tour.title,
      url: tour.url,
      description: tour.description || "",
    });
  };

  const handleUpdateTour = () => {
    if (!editingTour || !formData.title || !formData.url) return;

    setTours((prev) =>
      prev.map((tour) =>
        tour.id === editingTour.id
          ? {
              ...tour,
              title: formData.title,
              url: formData.url,
              description: formData.description,
            }
          : tour
      )
    );

    setEditingTour(null);
    setFormData({ title: "", url: "", description: "" });
  };

  const handleDeleteTour = (tourId: string) => {
    setTours((prev) => prev.filter((tour) => tour.id !== tourId));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tours.map((tour) => (
          <div
            key={tour.id}
            className="group relative overflow-hidden rounded-lg border bg-gradient-to-br from-blue-50 to-indigo-100 p-4 transition-all duration-200 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Glasses className="h-5 w-5 text-blue-600" />
                  <h3 className="font-medium text-gray-900">{tour.title}</h3>
                </div>
                {tour.description && (
                  <p className="mt-1 text-sm text-gray-600">{tour.description}</p>
                )}
                <a
                  href={tour.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                >
                  Ver tour <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEditTour(tour)}
                  className="h-8 w-8 p-0 hover:bg-blue-200"
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteTour(tour.id)}
                  className="h-8 w-8 p-0 hover:bg-red-200 hover:text-red-600"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {/* Add new tour button */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <div className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 bg-white transition-all duration-200 hover:bg-gray-50">
              <Plus className="mb-2 h-6 w-6 text-gray-400" />
              <span className="text-sm font-medium text-gray-400">
                Añadir tour virtual
              </span>
            </div>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Añadir Tour Virtual</DialogTitle>
              <DialogDescription>
                Añade un enlace a un tour virtual de la propiedad.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Ej: Tour virtual 360°"
                />
              </div>
              <div>
                <Label htmlFor="url">URL del tour</Label>
                <Input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, url: e.target.value }))
                  }
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label htmlFor="description">Descripción (opcional)</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Descripción del tour..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setFormData({ title: "", url: "", description: "" });
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleAddTour}>Añadir</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit tour dialog */}
      <Dialog
        open={!!editingTour}
        onOpenChange={(open) => {
          if (!open) {
            setEditingTour(null);
            setFormData({ title: "", url: "", description: "" });
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Tour Virtual</DialogTitle>
            <DialogDescription>
              Modifica la información del tour virtual.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Título</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Ej: Tour virtual 360°"
              />
            </div>
            <div>
              <Label htmlFor="edit-url">URL del tour</Label>
              <Input
                id="edit-url"
                type="url"
                value={formData.url}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, url: e.target.value }))
                }
                placeholder="https://..."
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Descripción (opcional)</Label>
              <Input
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Descripción del tour..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditingTour(null);
                setFormData({ title: "", url: "", description: "" });
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleUpdateTour}>Guardar cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}