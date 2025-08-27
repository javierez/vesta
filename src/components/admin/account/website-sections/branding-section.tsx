"use client";

import { useEffect } from "react";
import { Image as ImageIcon, RefreshCw } from "lucide-react";
import { Button } from "~/components/ui/button";
import type { BrandingSectionProps } from "../types/website-sections";

export function BrandingSection({
  form,
  isActive,
  onUnsavedChanges,
}: BrandingSectionProps) {
  // Watch for form changes to detect unsaved changes - PRESERVE existing logic
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "logo" || name === "favicon" || name === "logotype") {
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
          <ImageIcon className="h-5 w-5 text-gray-500" />
          Marca
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Logo y favicon de tu empresa
        </p>
      </div>

      <div className="space-y-6">
        {/* Logo Section */}
        <div>
          <h3 className="mb-3 text-sm font-medium text-gray-700">Logo</h3>
          {form.watch("logo") ? (
            <div className="group relative inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={form.watch("logo")}
                alt="Logo preview"
                className="max-h-24 object-contain"
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
                  (window.location.href =
                    "http://localhost:3000/account-admin/branding")
                }
                className="absolute inset-0 flex items-center justify-center rounded bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              >
                <RefreshCw className="h-6 w-6 text-white" />
              </button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                (window.location.href =
                  "http://localhost:3000/account-admin/branding")
              }
            >
              Configurar logo
            </Button>
          )}
        </div>

        {/* Favicon Section */}
        <div>
          <h3 className="mb-3 text-sm font-medium text-gray-700">Favicon</h3>
          {form.watch("favicon") ? (
            <div className="group relative inline-block">
              {/* eslint-disable-next-next/no-img-element */}
              <img
                src={form.watch("favicon")}
                alt="Favicon preview"
                className="max-h-24 object-contain"
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
                  (window.location.href =
                    "http://localhost:3000/account-admin/branding")
                }
                className="absolute inset-0 flex items-center justify-center rounded bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              >
                <RefreshCw className="h-4 w-4 text-white" />
              </button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                (window.location.href =
                  "http://localhost:3000/account-admin/branding")
              }
            >
              Configurar favicon
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
