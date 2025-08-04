
import type { FC } from "react";
import { useState, useMemo } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Checkbox } from "~/components/ui/checkbox";
import {
  FileImage,
  Download,
  Eye,
  Star,
  Search,
  Filter,
  CheckCircle2,
  ArrowUpDown,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type {
  TemplateGalleryProps,
  CarteleriaTemplate,
} from "~/types/carteleria";
import {
  sampleTemplates,
  getStyleById,
  getFormatById,
  getPropertyTypeById,
} from "~/lib/carteleria/templates";

type SortOption = "featured" | "name" | "recent";

export const TemplateGallery: FC<TemplateGalleryProps> = ({
  templates = sampleTemplates,
  selectedTemplateIds,
  onTemplateToggle,
  filters = {},
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [showOnlySelected, setShowOnlySelected] = useState(false);

  // Filter and sort templates
  const filteredAndSortedTemplates = useMemo(() => {
    let filtered = templates;

    // Apply filters from props
    if (filters.styleId) {
      filtered = filtered.filter(
        (template) => template.styleId === filters.styleId,
      );
    }
    if (filters.formatIds && filters.formatIds.length > 0) {
      filtered = filtered.filter((template) =>
        filters.formatIds!.includes(template.formatId),
      );
    }
    if (filters.propertyTypeIds && filters.propertyTypeIds.length > 0) {
      filtered = filtered.filter((template) =>
        filters.propertyTypeIds!.includes(template.propertyTypeId),
      );
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (template) =>
          template.name.toLowerCase().includes(query) ||
          template.description.toLowerCase().includes(query) ||
          template.tags.some((tag) => tag.toLowerCase().includes(query)),
      );
    }

    // Apply selection filter
    if (showOnlySelected) {
      filtered = filtered.filter((template) =>
        selectedTemplateIds.includes(template.id),
      );
    }

    // Sort templates
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "featured":
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return a.name.localeCompare(b.name);
        case "name":
          return a.name.localeCompare(b.name);
        case "recent":
          // Since we don't have creation dates, we'll use ID as a proxy
          return b.id.localeCompare(a.id);
        default:
          return 0;
      }
    });

    return filtered;
  }, [
    templates,
    filters,
    searchQuery,
    sortBy,
    showOnlySelected,
    selectedTemplateIds,
  ]);

  const featuredTemplates = filteredAndSortedTemplates.filter(
    (t) => t.featured,
  );

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Galería de Plantillas
        </h2>
        <p className="text-gray-600">
          Explora y selecciona las plantillas que mejor se adapten a tus
          necesidades
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <Input
            placeholder="Buscar plantillas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={sortBy}
            onValueChange={(value: SortOption) => setSortBy(value)}
          >
            <SelectTrigger className="w-[160px]">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Destacadas</SelectItem>
              <SelectItem value="name">Nombre A-Z</SelectItem>
              <SelectItem value="recent">Más recientes</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={showOnlySelected ? "default" : "outline"}
            size="sm"
            onClick={() => setShowOnlySelected(!showOnlySelected)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Solo seleccionadas
            {selectedTemplateIds.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {selectedTemplateIds.length}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          {filteredAndSortedTemplates.length} plantilla
          {filteredAndSortedTemplates.length !== 1 ? "s" : ""}
          {searchQuery && ` para "${searchQuery}"`}
        </span>
        {selectedTemplateIds.length > 0 && (
          <span className="font-medium text-primary">
            {selectedTemplateIds.length} seleccionada
            {selectedTemplateIds.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Featured Section */}
      {featuredTemplates.length > 0 && !showOnlySelected && !searchQuery && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-900">
              Plantillas Destacadas
            </h3>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredTemplates.slice(0, 6).map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                isSelected={selectedTemplateIds.includes(template.id)}
                onToggle={() => onTemplateToggle(template.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* All Templates Section */}
      <div className="space-y-4">
        {!showOnlySelected && !searchQuery && featuredTemplates.length > 0 && (
          <h3 className="text-lg font-semibold text-gray-900">
            Todas las Plantillas
          </h3>
        )}

        {filteredAndSortedTemplates.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredAndSortedTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                isSelected={selectedTemplateIds.includes(template.id)}
                onToggle={() => onTemplateToggle(template.id)}
              />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <FileImage className="mx-auto mb-4 h-16 w-16 text-gray-300" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              No se encontraron plantillas
            </h3>
            <p className="text-gray-500">
              {searchQuery
                ? `Intenta con otros términos de búsqueda`
                : `Ajusta los filtros para ver más opciones`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

interface TemplateCardProps {
  template: CarteleriaTemplate;
  isSelected: boolean;
  onToggle: () => void;
}

const TemplateCard: FC<TemplateCardProps> = ({
  template,
  isSelected,
  onToggle,
}) => {
  const style = getStyleById(template.styleId);
  const format = getFormatById(template.formatId);
  const propertyType = getPropertyTypeById(template.propertyTypeId);

  return (
    <Card className="group cursor-pointer transition-all duration-200 hover:shadow-lg">
      <CardHeader className="space-y-3">
        <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden rounded-lg bg-gray-100">
          <Image
            src={template.preview}
            alt={`Vista previa de ${template.name}`}
            fill
            className="object-cover transition-transform duration-200 group-hover:scale-110"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
            }}
          />

          {/* Fallback when image fails to load */}
          <FileImage className="absolute inset-0 m-auto h-16 w-16 text-gray-400" />

          {/* Selection overlay */}
          {isSelected && (
            <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
              <div className="rounded-full bg-primary p-2">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base group-hover:text-primary">
              {template.name}
            </CardTitle>
            <div className="flex items-center gap-1">
              {template.featured && (
                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
              )}
              <Checkbox checked={isSelected} onCheckedChange={onToggle} />
            </div>
          </div>

          <div className="flex flex-wrap gap-1">
            {style && (
              <Badge variant="outline" className="text-xs">
                {style.name}
              </Badge>
            )}
            {format && (
              <Badge variant="secondary" className="text-xs">
                {format.name}
              </Badge>
            )}
            {propertyType && (
              <Badge variant="outline" className="text-xs">
                {propertyType.name}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4" onClick={(e) => e.stopPropagation()}>
        <CardDescription className="text-sm">
          {template.description}
        </CardDescription>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1">
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
