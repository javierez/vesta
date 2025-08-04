"use client";

import type { FC } from "react";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { FileImage, Download, Eye, Star } from "lucide-react";

interface CarteleriaTemplate {
  id: string;
  name: string;
  description: string;
  category: "venta" | "alquiler" | "promocional";
  featured: boolean;
  preview: string;
}

const templates: CarteleriaTemplate[] = [
  {
    id: "1",
    name: "Clásico Venta",
    description: "Diseño elegante y profesional para propiedades en venta",
    category: "venta",
    featured: true,
    preview: "/templates/clasico-venta.jpg",
  },
  {
    id: "2",
    name: "Moderno Alquiler",
    description: "Plantilla moderna con información destacada de alquiler",
    category: "alquiler",
    featured: false,
    preview: "/templates/moderno-alquiler.jpg",
  },
  {
    id: "3",
    name: "Premium Venta",
    description: "Diseño premium para propiedades de alto valor",
    category: "venta",
    featured: true,
    preview: "/templates/premium-venta.jpg",
  },
  {
    id: "4",
    name: "Promocional Especial",
    description: "Cartel llamativo para promociones y ofertas especiales",
    category: "promocional",
    featured: false,
    preview: "/templates/promocional.jpg",
  },
  {
    id: "5",
    name: "Minimalista Alquiler",
    description: "Diseño limpio y minimalista para alquileres",
    category: "alquiler",
    featured: false,
    preview: "/templates/minimalista-alquiler.jpg",
  },
  {
    id: "6",
    name: "Exclusivo Venta",
    description: "Plantilla exclusiva con elementos de lujo",
    category: "venta",
    featured: true,
    preview: "/templates/exclusivo-venta.jpg",
  },
];

const categoryLabels = {
  venta: "Venta",
  alquiler: "Alquiler",
  promocional: "Promocional",
};

const categoryColors = {
  venta: "bg-green-100 text-green-800",
  alquiler: "bg-blue-100 text-blue-800",
  promocional: "bg-purple-100 text-purple-800",
};

export const CarteleriaTemplates: FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredTemplates = templates.filter(
    (template) =>
      selectedCategory === "all" || template.category === selectedCategory,
  );

  const featuredTemplates = templates.filter((template) => template.featured);

  return (
    <div className="space-y-8">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory("all")}
        >
          Todas las plantillas
        </Button>
        <Button
          variant={selectedCategory === "venta" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory("venta")}
        >
          Venta
        </Button>
        <Button
          variant={selectedCategory === "alquiler" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory("alquiler")}
        >
          Alquiler
        </Button>
        <Button
          variant={selectedCategory === "promocional" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory("promocional")}
        >
          Promocional
        </Button>
      </div>

      {/* Featured Templates Section */}
      {selectedCategory === "all" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <h2 className="text-lg font-semibold text-gray-900">
              Plantillas Destacadas
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredTemplates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        </div>
      )}

      {/* All Templates Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {selectedCategory === "all"
            ? "Todas las Plantillas"
            : `Plantillas de ${categoryLabels[selectedCategory as keyof typeof categoryLabels]}`}
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      </div>
    </div>
  );
};

const TemplateCard: FC<{ template: CarteleriaTemplate }> = ({ template }) => {
  return (
    <Card className="group cursor-pointer transition-all duration-200 hover:shadow-lg">
      <CardHeader className="space-y-3">
        <div className="flex aspect-[3/4] items-center justify-center overflow-hidden rounded-lg bg-gray-100">
          <FileImage className="h-16 w-16 text-gray-400" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base group-hover:text-primary">
              {template.name}
            </CardTitle>
            {template.featured && (
              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
            )}
          </div>
          <Badge className={categoryColors[template.category]}>
            {categoryLabels[template.category]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <CardDescription className="text-sm">
          {template.description}
        </CardDescription>
        <div className="flex gap-2">
          <Button size="sm" className="flex-1">
            <Eye className="mr-2 h-4 w-4" />
            Vista previa
          </Button>
          <Button size="sm" variant="outline">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
