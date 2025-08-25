"use client";

import { useEffect } from "react";
import { Code } from "lucide-react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import type { HeadSectionProps } from "../types/website-sections";

export function HeadSection({ form, isActive, onUnsavedChanges }: HeadSectionProps) {
  // Watch for form changes to detect unsaved changes - PRESERVE existing logic
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name?.startsWith('headProps')) {
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
          <Code className="h-5 w-5 text-gray-500" />
          Scripts y Código Personalizado
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Añade scripts de seguimiento y código personalizado
        </p>
      </div>

      <div className="space-y-4">
        {/* Google Analytics Field */}
        <FormField
          control={form.control}
          name="headProps.googleAnalytics"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Google Analytics ID</FormLabel>
              <FormDescription>
                ID de seguimiento de Google Analytics (ej: G-XXXXXXXXXX)
              </FormDescription>
              <FormControl>
                <Input {...field} placeholder="G-XXXXXXXXXX" />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Facebook Pixel Field */}
        <FormField
          control={form.control}
          name="headProps.facebookPixel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Facebook Pixel ID</FormLabel>
              <FormDescription>
                ID del píxel de Facebook para seguimiento
              </FormDescription>
              <FormControl>
                <Input {...field} placeholder="1234567890" />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Custom Scripts Field */}
        <FormField
          control={form.control}
          name="headProps.customScripts"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Scripts Personalizados</FormLabel>
              <FormDescription>
                Código HTML/JavaScript personalizado para el head
              </FormDescription>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="<!-- Tu código personalizado aquí -->"
                  rows={6}
                  className="font-mono text-sm"
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}