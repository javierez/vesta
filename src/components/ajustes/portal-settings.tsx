"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "~/components/ui/form";
import { Switch } from "~/components/ui/switch";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Loader2, Globe, ExternalLink, Zap } from "lucide-react";
import { toast } from "sonner";
import {
  updatePortalSettingsAction,
  getAccountSettingsAction,
} from "~/app/actions/settings";
import { portalSettingsSchema } from "~/types/settings";
import type { PortalInput, AccountSettings } from "~/types/settings";

interface PortalSettingsProps {
  accountId: bigint;
  initialData?: AccountSettings;
}

export function PortalSettings({
  accountId,
  initialData,
}: PortalSettingsProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Extract portal settings from account settings
  const portalSettings = initialData?.portalSettings ?? {};

  const form = useForm<PortalInput>({
    resolver: zodResolver(portalSettingsSchema),
    defaultValues: {
      fotocasaEnabled: (portalSettings.fotocasaEnabled as boolean) ?? false,
      idealiistaEnabled: (portalSettings.idealiistaEnabled as boolean) ?? false,
      pisocomEnabled: (portalSettings.pisocomEnabled as boolean) ?? false,
      autoPublish: (portalSettings.autoPublish as boolean) ?? false,
    },
  });

  // Load account settings if not provided
  useEffect(() => {
    if (!initialData) {
      const loadAccountSettings = async () => {
        const result = await getAccountSettingsAction(accountId);
        if (result.success && result.data) {
          const portalSettings = result.data.portalSettings ?? {};
          form.reset({
            fotocasaEnabled:
              (portalSettings.fotocasaEnabled as boolean) ?? false,
            idealiistaEnabled:
              (portalSettings.idealiistaEnabled as boolean) ?? false,
            pisocomEnabled: (portalSettings.pisocomEnabled as boolean) ?? false,
            autoPublish: (portalSettings.autoPublish as boolean) ?? false,
          });
        }
      };
      void loadAccountSettings();
    }
  }, [accountId, initialData, form]);

  const onSubmit = (data: PortalInput) => {
    startTransition(async () => {
      try {
        setError(null);
        const result = await updatePortalSettingsAction(accountId, data);

        if (result.success) {
          toast.success("Configuración de portales actualizada correctamente");
        } else {
          setError(
            result.error ?? "Error al actualizar la configuración de portales",
          );
        }
      } catch (error) {
        console.error("Error updating portal settings:", error);
        setError("Error inesperado al actualizar la configuración");
      }
    });
  };

  const portals = [
    {
      name: "Fotocasa",
      description:
        "Portal inmobiliario líder en España con millones de visitas mensuales",
      website: "https://www.fotocasa.es",
      field: "fotocasaEnabled" as const,
      color: "bg-orange-500",
    },
    {
      name: "Idealista",
      description: "El portal inmobiliario más popular de España y Portugal",
      website: "https://www.idealista.com",
      field: "idealiistaEnabled" as const,
      color: "bg-green-500",
    },
    {
      name: "Pisos.com",
      description:
        "Portal inmobiliario con amplia presencia en el mercado español",
      website: "https://www.pisos.com",
      field: "pisocomEnabled" as const,
      color: "bg-blue-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Portal Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Portales Inmobiliarios
          </CardTitle>
          <CardDescription>
            Configura la publicación automática en los principales portales
            inmobiliarios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                {portals.map((portal) => (
                  <FormField
                    key={portal.field}
                    control={form.control}
                    name={portal.field}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-3">
                            <div
                              className={`h-3 w-3 rounded-full ${portal.color}`}
                            />
                            <FormLabel className="text-base font-medium">
                              {portal.name}
                            </FormLabel>
                            <a
                              href={portal.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </div>
                          <FormDescription className="max-w-lg">
                            {portal.description}
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                ))}
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={isPending}
                className="w-full md:w-auto"
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Configuración
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Auto-publish Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Publicación Automática
          </CardTitle>
          <CardDescription>
            Configura la publicación automática de nuevas propiedades en los
            portales habilitados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="autoPublish"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Publicación automática
                      </FormLabel>
                      <FormDescription>
                        Publica automáticamente las nuevas propiedades en todos
                        los portales habilitados. Puedes revisar y editar las
                        publicaciones antes de que se hagan efectivas.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={isPending}
                className="w-full md:w-auto"
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Configuración
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Portal Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Estado de los Portales</CardTitle>
          <CardDescription>
            Resumen de la configuración actual de publicación.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {portals.map((portal) => {
              const isEnabled = form.watch(portal.field);
              return (
                <div
                  key={portal.field}
                  className="flex items-center gap-3 text-sm"
                >
                  <div
                    className={`h-2 w-2 rounded-full ${isEnabled ? portal.color : "bg-gray-300"}`}
                  />
                  <span
                    className={
                      isEnabled ? "text-foreground" : "text-muted-foreground"
                    }
                  >
                    {portal.name}: {isEnabled ? "Habilitado" : "Deshabilitado"}
                  </span>
                </div>
              );
            })}
            <div className="flex items-center gap-3 border-t pt-2 text-sm">
              <div
                className={`h-2 w-2 rounded-full ${form.watch("autoPublish") ? "bg-purple-500" : "bg-gray-300"}`}
              />
              <span
                className={
                  form.watch("autoPublish")
                    ? "text-foreground"
                    : "text-muted-foreground"
                }
              >
                Publicación automática:{" "}
                {form.watch("autoPublish") ? "Activada" : "Desactivada"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
