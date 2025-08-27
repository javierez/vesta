"use client";

import { useState, useEffect } from "react";
import { Edit, Plus, RefreshCw, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { toast } from "sonner";
import {
  getTestimonialsAction,
  createTestimonialAction,
  updateTestimonialAction,
  deleteTestimonialAction,
  seedTestimonialsAction,
} from "~/app/actions/website-settings";
import { type Testimonial } from "~/types/website-settings";
import type { TestimonialManagerProps } from "../../types/website-sections";

export function TestimonialManager({ accountId }: TestimonialManagerProps) {
  // CRITICAL: Preserve all existing CRUD state management
  const [dbTestimonials, setDbTestimonials] = useState<Testimonial[]>([]);
  const [editingTestimonial, setEditingTestimonial] = useState<string | null>(
    null,
  );
  const [showAddTestimonial, setShowAddTestimonial] = useState(false);
  const [showAvatarInput, setShowAvatarInput] = useState<string | null>(null);
  const [loadingTestimonials, setLoadingTestimonials] = useState(false);

  // PATTERN: Load testimonials with seeding logic - PRESERVE existing sequence
  const loadTestimonials = async (userAccountId: bigint) => {
    try {
      console.log(
        "🔄 CLIENT: Starting loadTestimonials for accountId:",
        userAccountId,
      );
      setLoadingTestimonials(true);

      // Seed testimonials if none exist
      console.log("🌱 CLIENT: Calling seedTestimonialsAction...");
      const seedResult = await seedTestimonialsAction(userAccountId);
      console.log("🌱 CLIENT: Seed result:", seedResult);

      console.log("📖 CLIENT: Calling getTestimonialsAction...");
      const testimonialsResult = await getTestimonialsAction(userAccountId);
      console.log("📖 CLIENT: Get testimonials result:", testimonialsResult);

      if (testimonialsResult.success && testimonialsResult.data) {
        console.log(
          "✅ CLIENT: Setting",
          testimonialsResult.data.length,
          "testimonials to state",
        );
        // Convert null avatars to undefined to match the schema
        const testimonials = testimonialsResult.data.map((t) => ({
          ...t,
          avatar: t.avatar ?? undefined,
        }));
        setDbTestimonials(testimonials);
      } else {
        console.log("❌ CLIENT: No testimonials data or failed request");
      }
    } catch (error) {
      console.error("❌ CLIENT: Error loading testimonials:", error);
    } finally {
      console.log("🏁 CLIENT: Finished loading testimonials");
      setLoadingTestimonials(false);
    }
  };

  // Load testimonials on mount
  useEffect(() => {
    if (accountId) {
      void loadTestimonials(accountId);
    }
  }, [accountId]);

  // CRITICAL: Preserve all CRUD operations exactly
  const handleCreateTestimonial = async () => {
    if (!accountId) return;

    const newTestimonialData = {
      name: "Nuevo Testimonio",
      role: "Cliente",
      content: "Escribe aquí el testimonio...",
      avatar: undefined,
      rating: 5,
      is_verified: true,
      sort_order: dbTestimonials.length + 1,
      is_active: true,
    };

    console.log(
      "➕ CLIENT: Creating new testimonial with data:",
      newTestimonialData,
    );
    try {
      const result = await createTestimonialAction(
        accountId,
        newTestimonialData,
      );
      console.log("➕ CLIENT: Create testimonial result:", result);

      if (result.success && result.data) {
        console.log(
          "✅ CLIENT: Testimonial created successfully, reloading...",
        );
        await loadTestimonials(accountId);
        setEditingTestimonial(result.data.testimonial_id);
        setShowAddTestimonial(false);
        toast.success("Testimonio creado correctamente");
      } else {
        console.log("❌ CLIENT: Failed to create testimonial:", result.error);
        toast.error(result.error ?? "Error al crear el testimonio");
      }
    } catch (error) {
      console.error("❌ CLIENT: Error creating testimonial:", error);
      toast.error("Error al crear el testimonio");
    }
  };

  const handleDeleteTestimonial = async (testimonialId: string) => {
    if (!accountId) return;

    try {
      const result = await deleteTestimonialAction(accountId, testimonialId);
      if (result.success) {
        await loadTestimonials(accountId);
        toast.success("Testimonio eliminado correctamente");
      } else {
        toast.error(result.error ?? "Error al eliminar el testimonio");
      }
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      toast.error("Error al eliminar el testimonio");
    }
  };

  // PRESERVE existing update logic with local state sync
  const updateTestimonialField = async (
    testimonialId: string,
    field: keyof Testimonial,
    value: string | number | boolean,
  ) => {
    if (!accountId) return;

    // Update local state immediately
    setDbTestimonials((prev) =>
      prev.map((testimonial) => {
        if (testimonial.testimonial_id === testimonialId) {
          return { ...testimonial, [field]: value };
        }
        return testimonial;
      }),
    );

    // Find the testimonial and update in database
    const testimonial = dbTestimonials.find(
      (t) => t.testimonial_id === testimonialId,
    );
    if (!testimonial) return;

    const updatedTestimonial = { ...testimonial, [field]: value };

    try {
      const result = await updateTestimonialAction(accountId, testimonialId, {
        name: updatedTestimonial.name,
        role: updatedTestimonial.role,
        content: updatedTestimonial.content,
        avatar: updatedTestimonial.avatar ?? undefined,
        rating: updatedTestimonial.rating,
        is_verified: updatedTestimonial.is_verified,
        sort_order: updatedTestimonial.sort_order,
        is_active: updatedTestimonial.is_active,
      });

      if (!result.success) {
        // Revert local state on error
        await loadTestimonials(accountId);
        toast.error(result.error ?? "Error al actualizar el testimonio");
      }
    } catch (error) {
      console.error("Error updating testimonial:", error);
      // Revert local state on error
      await loadTestimonials(accountId);
      toast.error("Error al actualizar el testimonio");
    }
  };

  return (
    <div className="space-y-4">
      {/* Add Testimonial Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">
          Testimonios Guardados
        </h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowAddTestimonial(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Añadir Testimonio
        </Button>
      </div>

      {/* Create New Testimonial Modal */}
      {showAddTestimonial && (
        <div className="rounded-lg border bg-yellow-50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-medium">Crear nuevo testimonio</h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAddTestimonial(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="mb-4 text-sm text-gray-600">
            Se creará un testimonio de ejemplo que puedes editar después.
          </p>
          <div className="flex gap-2">
            <Button type="button" size="sm" onClick={handleCreateTestimonial}>
              Crear Testimonio
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAddTestimonial(false)}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loadingTestimonials && (
        <div className="py-4 text-center">
          <RefreshCw className="mx-auto h-6 w-6 animate-spin text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">Cargando testimonios...</p>
        </div>
      )}

      {/* Testimonials List - PRESERVE all existing testimonial management UI */}
      {dbTestimonials.length > 0 && !loadingTestimonials && (
        <div className="space-y-3">
          {dbTestimonials.map((testimonial, index) => (
            <div
              key={testimonial.testimonial_id}
              className="rounded-lg border p-4"
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">#{index + 1}</span>
                  <span className="text-sm text-gray-500">
                    {testimonial.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setEditingTestimonial(
                        editingTestimonial === testimonial.testimonial_id
                          ? null
                          : testimonial.testimonial_id,
                      )
                    }
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleDeleteTestimonial(testimonial.testimonial_id)
                    }
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Editing Mode - PRESERVE all existing form fields */}
              {editingTestimonial === testimonial.testimonial_id && (
                <div className="space-y-4 rounded-lg bg-gray-50 p-4">
                  {/* Name and Role */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Nombre
                      </label>
                      <Input
                        value={testimonial.name}
                        onChange={(e) =>
                          updateTestimonialField(
                            testimonial.testimonial_id,
                            "name",
                            e.target.value,
                          )
                        }
                        placeholder="María González"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Rol/Título
                      </label>
                      <Input
                        value={testimonial.role}
                        onChange={(e) =>
                          updateTestimonialField(
                            testimonial.testimonial_id,
                            "role",
                            e.target.value,
                          )
                        }
                        placeholder="Compradora"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Testimonio
                    </label>
                    <Textarea
                      value={testimonial.content}
                      onChange={(e) =>
                        updateTestimonialField(
                          testimonial.testimonial_id,
                          "content",
                          e.target.value,
                        )
                      }
                      placeholder="El servicio fue excelente..."
                      rows={4}
                      className="mt-1"
                    />
                  </div>

                  {/* Avatar */}
                  <div>
                    <label className="mb-3 text-sm font-medium text-gray-700">
                      Avatar
                    </label>
                    {testimonial.avatar &&
                    showAvatarInput !== testimonial.testimonial_id ? (
                      <div className="group relative mt-3 inline-block">
                        <img
                          src={testimonial.avatar}
                          alt={`Avatar de ${testimonial.name}`}
                          className="h-16 w-16 rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            const nextElement = e.currentTarget
                              .nextElementSibling as HTMLElement;
                            if (nextElement) {
                              nextElement.classList.remove("hidden");
                            }
                          }}
                        />
                        <p className="hidden text-sm text-red-500">
                          Error al cargar la imagen
                        </p>
                        <button
                          type="button"
                          onClick={() =>
                            setShowAvatarInput(testimonial.testimonial_id)
                          }
                          className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                        >
                          <RefreshCw className="h-4 w-4 text-white" />
                        </button>
                      </div>
                    ) : !testimonial.avatar &&
                      showAvatarInput !== testimonial.testimonial_id ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setShowAvatarInput(testimonial.testimonial_id)
                        }
                        className="mt-3"
                      >
                        Configurar avatar
                      </Button>
                    ) : (
                      <div className="mt-3">
                        <Input
                          value={testimonial.avatar ?? ""}
                          onChange={(e) =>
                            updateTestimonialField(
                              testimonial.testimonial_id,
                              "avatar",
                              e.target.value,
                            )
                          }
                          placeholder="/properties/confident-leader.png"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAvatarInput(null)}
                          className="mt-2"
                        >
                          Cancelar
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Rating and Order */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Calificación
                      </label>
                      <Input
                        type="number"
                        min="1"
                        max="5"
                        value={testimonial.rating}
                        onChange={(e) =>
                          updateTestimonialField(
                            testimonial.testimonial_id,
                            "rating",
                            parseInt(e.target.value) || 5,
                          )
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Orden
                      </label>
                      <Input
                        type="number"
                        value={testimonial.sort_order}
                        onChange={(e) =>
                          updateTestimonialField(
                            testimonial.testimonial_id,
                            "sort_order",
                            parseInt(e.target.value) || 1,
                          )
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={testimonial.is_verified}
                        onChange={(e) =>
                          updateTestimonialField(
                            testimonial.testimonial_id,
                            "is_verified",
                            e.target.checked,
                          )
                        }
                        className="rounded border-gray-300"
                      />
                      <label className="text-sm font-medium text-gray-700">
                        Verificado
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={testimonial.is_active}
                        onChange={(e) =>
                          updateTestimonialField(
                            testimonial.testimonial_id,
                            "is_active",
                            e.target.checked,
                          )
                        }
                        className="rounded border-gray-300"
                      />
                      <label className="text-sm font-medium text-gray-700">
                        Activo
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Display Mode */}
              {editingTestimonial !== testimonial.testimonial_id && (
                <div className="space-y-1 text-sm text-gray-600">
                  {testimonial.role && (
                    <p className="font-medium">{testimonial.role}</p>
                  )}
                  <p className="line-clamp-2">{testimonial.content}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>⭐ {testimonial.rating}/5</span>
                    <span>#{testimonial.sort_order}</span>
                    {testimonial.is_verified && <span>✓ Verificado</span>}
                    {testimonial.is_active && <span>● Activo</span>}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {dbTestimonials.length === 0 && !loadingTestimonials && (
        <div className="py-8 text-center text-gray-500">
          <p>No hay testimonios configurados</p>
          <p className="mt-1 text-sm">
            Haz clic en &quot;Añadir Testimonio&quot; para comenzar
          </p>
        </div>
      )}
    </div>
  );
}
