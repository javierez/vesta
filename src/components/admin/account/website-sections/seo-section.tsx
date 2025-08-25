
import { useEffect } from "react";
import { Search } from "lucide-react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import type { SEOSectionProps } from "../types/website-sections";

export function SEOSection({ form, isActive, onUnsavedChanges }: SEOSectionProps) {
  // Watch for form changes to detect unsaved changes - PRESERVE existing logic
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name?.startsWith('seoProps')) {
        onUnsavedChanges(true);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, onUnsavedChanges]);

  // Only render when active section
  if (!isActive) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
          <Search className="h-5 w-5 text-gray-500" />
          Optimización SEO
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Mejora la visibilidad de tu sitio en los motores de búsqueda
        </p>
      </div>

      <div className="space-y-4">
        {/* Title Field */}
        <FormField
          control={form.control}
          name="seoProps.title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título del Sitio</FormLabel>
              <FormDescription>
                Aparece en los resultados de búsqueda y en la pestaña del navegador
              </FormDescription>
              <FormControl>
                <Input {...field} placeholder="Mi Inmobiliaria | Las mejores propiedades" />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Description Field */}
        <FormField
          control={form.control}
          name="seoProps.description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meta Descripción</FormLabel>
              <FormDescription>
                Descripción breve que aparece en los resultados de búsqueda
              </FormDescription>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Encuentra las mejores propiedades en venta y alquiler..."
                  rows={3}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Keywords Field */}
        <FormField
          control={form.control}
          name="seoProps.keywords"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Palabras Clave</FormLabel>
              <FormDescription>
                Separadas por comas, ayudan a los motores de búsqueda
              </FormDescription>
              <FormControl>
                <Input {...field} placeholder="inmobiliaria, pisos, casas, alquiler, venta" />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Open Graph Image Field */}
        <FormField
          control={form.control}
          name="seoProps.ogImage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Imagen Open Graph</FormLabel>
              <FormDescription>
                Imagen que aparece al compartir en redes sociales
              </FormDescription>
              <FormControl>
                <Input {...field} placeholder="https://ejemplo.com/imagen-og.jpg" />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}