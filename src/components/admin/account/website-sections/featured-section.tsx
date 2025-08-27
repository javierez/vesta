"use client";

import { useEffect } from "react";
import { Star } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import type { FeaturedSectionProps } from "../types/website-sections";

export function FeaturedSection({
  form,
  isActive,
  onUnsavedChanges,
}: FeaturedSectionProps) {
  // Watch for form changes to detect unsaved changes - PRESERVE existing logic
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name?.startsWith("featuredProps")) {
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
          <Star className="h-5 w-5 text-gray-500" />
          Propiedades Destacadas
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Configuración de la sección de propiedades destacadas
        </p>
      </div>

      <div className="space-y-4">
        {/* Title Field */}
        <FormField
          control={form.control}
          name="featuredProps.title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título de la Sección</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Propiedades Destacadas" />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Subtitle Field */}
        <FormField
          control={form.control}
          name="featuredProps.subtitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subtítulo</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Las mejores oportunidades del mercado"
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Max Items Field */}
        <FormField
          control={form.control}
          name="featuredProps.maxItems"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número máximo de propiedades a mostrar</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  placeholder="6"
                  onChange={(e) =>
                    field.onChange(parseInt(e.target.value) || 6)
                  }
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
