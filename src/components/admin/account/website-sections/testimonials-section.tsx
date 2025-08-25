
import { useEffect } from "react";
import { MessageSquare } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { TestimonialManager } from "./components/testimonial-manager";
import type { TestimonialsSectionProps } from "../types/website-sections";

export function TestimonialsSection({ form, isActive, onUnsavedChanges, accountId }: TestimonialsSectionProps) {
  // Watch for form changes to detect unsaved changes - PRESERVE existing logic
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name?.startsWith('testimonialProps')) {
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
          <MessageSquare className="h-5 w-5 text-gray-500" />
          Testimonios
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Reseñas y testimonios de clientes
        </p>
      </div>

      <div className="space-y-6">
        {/* Basic Settings */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="testimonialProps.title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título de la Sección</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Lo que dicen nuestros clientes" />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="testimonialProps.subtitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subtítulo</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Experiencias reales de nuestros clientes satisfechos" />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* INTEGRATE TestimonialManager for complex CRUD operations */}
        {accountId && (
          <TestimonialManager 
            form={form} 
            accountId={accountId}
          />
        )}
      </div>
    </div>
  );
}