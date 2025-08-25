
import { useEffect } from "react";
import { Building } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import type { PropertiesSectionProps } from "../types/website-sections";

export function PropertiesSection({ form, isActive, onUnsavedChanges }: PropertiesSectionProps) {
  // Watch for form changes to detect unsaved changes - PRESERVE existing logic
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name?.startsWith('propertiesProps')) {
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
          <Building className="h-5 w-5 text-gray-500" />
          Configuración de Propiedades
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Ajustes para la visualización de propiedades
        </p>
      </div>

      <div className="space-y-4">
        {/* Title Field */}
        <FormField
          control={form.control}
          name="propertiesProps.title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título de la Sección</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Nuestras Propiedades" />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Subtitle Field */}
        <FormField
          control={form.control}
          name="propertiesProps.subtitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subtítulo</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Encuentra la propiedad perfecta para ti" />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Items Per Page Field */}
        <FormField
          control={form.control}
          name="propertiesProps.itemsPerPage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Propiedades por Página</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="number" 
                  placeholder="12"
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 12)}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Default Sort Field */}
        <FormField
          control={form.control}
          name="propertiesProps.defaultSort"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ordenamiento por defecto</FormLabel>
              <FormControl>
                <select 
                  {...field} 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="price-desc">Precio: Mayor a menor</option>
                  <option value="price-asc">Precio: Menor a mayor</option>
                  <option value="date-desc">Más recientes primero</option>
                  <option value="date-asc">Más antiguos primero</option>
                </select>
              </FormControl>
            </FormItem>
          )}
        />

        {/* Button Text Field */}
        <FormField
          control={form.control}
          name="propertiesProps.buttonText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Texto del botón</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ver Todas las Propiedades" />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}