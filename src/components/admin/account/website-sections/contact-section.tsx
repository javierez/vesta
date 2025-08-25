"use client";

import { useEffect } from "react";
import { Phone } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { OfficeManager } from "./components/office-manager";
import type { ContactSectionProps } from "../types/website-sections";

export function ContactSection({ form, isActive, onUnsavedChanges, accountId }: ContactSectionProps) {
  // Watch for form changes to detect unsaved changes - PRESERVE existing logic
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name?.startsWith('contactProps')) {
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
          <Phone className="h-5 w-5 text-gray-500" />
          Información de Contacto
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Configuración de información de contacto y oficinas
        </p>
      </div>

      <div className="space-y-6">
        {/* Basic Settings */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="contactProps.title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Contáctanos" />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contactProps.subtitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subtítulo</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Estamos aquí para ayudarte en tu próximo paso inmobiliario" />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Display Options */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Opciones de Visualización</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="contactProps.messageForm"
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
                  <FormLabel className="text-sm">Formulario de mensaje</FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactProps.address"
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
                  <FormLabel className="text-sm">Mostrar dirección</FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactProps.phone"
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
                  <FormLabel className="text-sm">Mostrar teléfono</FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactProps.mail"
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
                  <FormLabel className="text-sm">Mostrar email</FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactProps.schedule"
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
                  <FormLabel className="text-sm">Mostrar horarios</FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactProps.map"
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
                  <FormLabel className="text-sm">Mostrar mapa</FormLabel>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* INTEGRATE OfficeManager for complex CRUD operations */}
        {accountId && (
          <OfficeManager 
            form={form} 
            accountId={accountId}
          />
        )}
      </div>
    </div>
  );
}