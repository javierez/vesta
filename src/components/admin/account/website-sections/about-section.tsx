"use client";

import { useEffect } from "react";
import { Users } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { KPIConfiguration } from "./components/kpi-configuration";
import type { AboutSectionProps } from "../types/website-sections";

export function AboutSection({
  form,
  isActive,
  onUnsavedChanges,
}: AboutSectionProps) {
  // Watch for form changes to detect unsaved changes - PRESERVE existing logic
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name?.startsWith("aboutProps")) {
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
          <Users className="h-5 w-5 text-gray-500" />
          Sobre Nosotros
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Información sobre tu empresa
        </p>
      </div>

      <div className="space-y-4">
        {/* Title Field */}
        <FormField
          control={form.control}
          name="aboutProps.title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Sobre Nosotros" />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Subtitle Field */}
        <FormField
          control={form.control}
          name="aboutProps.subtitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subtítulo</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Tu socio de confianza en el viaje inmobiliario"
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Main Content Field */}
        <FormField
          control={form.control}
          name="aboutProps.content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contenido Principal</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="En nuestra inmobiliaria, creemos que encontrar la propiedad perfecta..."
                  rows={4}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Secondary Content Field */}
        <FormField
          control={form.control}
          name="aboutProps.content2"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contenido Secundario</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Nuestro enfoque personalizado y atención al detalle..."
                  rows={4}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Image Field */}
        <FormField
          control={form.control}
          name="aboutProps.image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Imagen</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="https://ejemplo.com/nosotros.jpg"
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Section Titles */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="aboutProps.servicesSectionTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título Sección Servicios</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Nuestros Servicios" />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="aboutProps.aboutSectionTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título Sección Misión</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Nuestra Misión" />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Button Text Field */}
        <FormField
          control={form.control}
          name="aboutProps.buttonName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Texto del Botón</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Contacta a Nuestro Equipo" />
              </FormControl>
            </FormItem>
          )}
        />

        {/* KPI Configuration - INTEGRATE KpiConfiguration sub-component */}
        <div>
          <h3 className="mb-3 text-sm font-medium text-gray-700">
            Indicadores Clave (KPIs)
          </h3>
          <KPIConfiguration form={form} />
        </div>

        {/* Services Configuration */}
        <div>
          <h3 className="mb-3 text-sm font-medium text-gray-700">Servicios</h3>
          <p className="mb-4 text-sm text-gray-600">
            Los servicios se pueden configurar desde el panel de administración.
          </p>

          <FormField
            control={form.control}
            name="aboutProps.maxServicesDisplayed"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Máximo de servicios a mostrar</FormLabel>
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
    </div>
  );
}
