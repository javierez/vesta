"use client";

import { useEffect, useState } from "react";
import { Home, RefreshCw } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import type { HeroSectionProps } from "../types/website-sections";

export function HeroSection({ form, isActive, onUnsavedChanges }: HeroSectionProps) {
  const [showHeroImageInput, setShowHeroImageInput] = useState(false);

  // Watch for form changes to detect unsaved changes - PRESERVE existing logic
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name?.startsWith('heroProps')) {
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
          <Home className="h-5 w-5 text-gray-500" />
          Sección Principal
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          La primera sección que ven los visitantes
        </p>
      </div>

      <div className="space-y-4">
        {/* Title Field */}
        <FormField
          control={form.control}
          name="heroProps.title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título Principal</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Encuentra Tu Casa Ideal" />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Subtitle Field */}
        <FormField
          control={form.control}
          name="heroProps.subtitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subtítulo</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Te ayudamos a encontrar la propiedad perfecta"
                  rows={2}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Background Image Field - PRESERVE complex show/hide logic */}
        <div>
          <FormLabel>Imagen de Fondo</FormLabel>
          {form.watch("heroProps.backgroundImage") && !showHeroImageInput ? (
            <div className="relative inline-block group mt-3 w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={form.watch("heroProps.backgroundImage")} 
                alt="Hero background preview" 
                className="w-full max-h-48 rounded object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                  if (nextElement) {
                    nextElement.classList.remove('hidden');
                  }
                }}
              />
              <p className="hidden text-sm text-red-500">Error al cargar la imagen</p>
              <button
                type="button"
                onClick={() => setShowHeroImageInput(true)}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded"
              >
                <RefreshCw className="h-6 w-6 text-white" />
              </button>
            </div>
          ) : !form.watch("heroProps.backgroundImage") && !showHeroImageInput ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowHeroImageInput(true)}
              className="mt-3"
            >
              Configurar imagen de fondo
            </Button>
          ) : (
            <FormField
              control={form.control}
              name="heroProps.backgroundImage"
              render={({ field }) => (
                <FormItem className="mt-3">
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="https://ejemplo.com/imagen-hero.jpg"
                      onBlur={(e) => {
                        field.onBlur();
                        if (!e.target.value) {
                          setShowHeroImageInput(false);
                        }
                      }}
                    />
                  </FormControl>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowHeroImageInput(false)}
                    className="text-gray-500"
                  >
                    Ocultar campo
                  </Button>
                </FormItem>
              )}
            />
          )}
        </div>

        {/* Primary Button Text Field */}
        <FormField
          control={form.control}
          name="heroProps.findPropertyButton"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Texto Botón Principal</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Explorar Propiedades" />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Secondary Button Text Field */}
        <FormField
          control={form.control}
          name="heroProps.contactButton"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Texto Botón Secundario</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Contáctanos" />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}