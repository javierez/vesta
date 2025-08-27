"use client";

import { useEffect } from "react";
import { FileText } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import type { FooterSectionProps } from "../types/website-sections";

export function FooterSection({
  form,
  isActive,
  onUnsavedChanges,
}: FooterSectionProps) {
  // Watch for form changes to detect unsaved changes - PRESERVE existing logic
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name?.startsWith("footerProps")) {
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
          <FileText className="h-5 w-5 text-gray-500" />
          Pie de Página
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Configuración del footer del sitio
        </p>
      </div>

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="footerProps.companyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre de la Empresa</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Mi Inmobiliaria" />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="footerProps.description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Tu socio de confianza para encontrar la propiedad perfecta..."
                    rows={3}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="footerProps.copyright"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Texto de Copyright</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="© 2024 Mi Inmobiliaria. Todos los derechos reservados."
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Quick Links Visibility - PRESERVE complex nested object handling */}
        <div>
          <h3 className="mb-3 text-sm font-medium text-gray-700">
            Enlaces Rápidos
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="footerProps.quickLinksVisibility.inicio"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="rounded border-gray-300"
                    />
                  </FormControl>
                  <FormLabel className="text-sm">Inicio</FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="footerProps.quickLinksVisibility.propiedades"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="rounded border-gray-300"
                    />
                  </FormControl>
                  <FormLabel className="text-sm">Propiedades</FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="footerProps.quickLinksVisibility.nosotros"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="rounded border-gray-300"
                    />
                  </FormControl>
                  <FormLabel className="text-sm">Nosotros</FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="footerProps.quickLinksVisibility.contacto"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="rounded border-gray-300"
                    />
                  </FormControl>
                  <FormLabel className="text-sm">Contacto</FormLabel>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Property Types Visibility - PRESERVE complex nested object handling */}
        <div>
          <h3 className="mb-3 text-sm font-medium text-gray-700">
            Tipos de Propiedades
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="footerProps.propertyTypesVisibility.pisos"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="rounded border-gray-300"
                    />
                  </FormControl>
                  <FormLabel className="text-sm">Pisos</FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="footerProps.propertyTypesVisibility.casas"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="rounded border-gray-300"
                    />
                  </FormControl>
                  <FormLabel className="text-sm">Casas</FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="footerProps.propertyTypesVisibility.locales"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="rounded border-gray-300"
                    />
                  </FormControl>
                  <FormLabel className="text-sm">Locales</FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="footerProps.propertyTypesVisibility.solares"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="rounded border-gray-300"
                    />
                  </FormControl>
                  <FormLabel className="text-sm">Solares</FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="footerProps.propertyTypesVisibility.garajes"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="rounded border-gray-300"
                    />
                  </FormControl>
                  <FormLabel className="text-sm">Garajes</FormLabel>
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
