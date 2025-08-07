"use client";

import { useState, useEffect, useTransition } from "react";
import { useSession } from "~/lib/auth-client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "~/lib/utils";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "~/components/ui/form";
import { Button } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";
import { Input } from "~/components/ui/input";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { 
  Globe, 
  Settings, 
  Loader2, 
  Droplet, 
  Check,
  ChevronRight,
  Key,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import {
  getPortalConfigurationAction,
  updatePortalConfigurationAction,
  getCurrentUserAccountId,
} from "~/app/actions/settings";
import {
  portalConfigurationSchema,
  type PortalConfigurationInput,
  type PortalTab,
} from "~/types/portal-settings";

const navigationItems: (PortalTab & { color?: string })[] = [
  {
    id: "fotocasa",
    label: "Fotocasa",
    description: "Publicación automática en Fotocasa",
    icon: Globe,
    color: "text-orange-500",
  },
  {
    id: "idealista",
    label: "Idealista",
    description: "Publicación automática en Idealista",
    icon: Globe,
    color: "text-green-500",
  },
  {
    id: "general",
    label: "General",
    description: "Ajustes generales",
    icon: Settings,
  },
];

export function PortalConfiguration() {
  const { data: session } = useSession();
  const [accountId, setAccountId] = useState<bigint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activeSection, setActiveSection] = useState("fotocasa");

  const form = useForm<PortalConfigurationInput>({
    resolver: zodResolver(portalConfigurationSchema),
    defaultValues: {
      fotocasa: { enabled: false, apiKey: "" },
      idealista: { enabled: false, apiKey: "" },
      general: { watermarkEnabled: false },
    },
  });

  useEffect(() => {
    const loadData = async () => {
      if (!session?.user?.id) return;

      try {
        setIsLoading(true);
        const userAccountId = await getCurrentUserAccountId(session.user.id);

        if (!userAccountId) {
          setError("No se pudo obtener el ID de la cuenta");
          return;
        }

        setAccountId(userAccountId);
        const result = await getPortalConfigurationAction(userAccountId);

        if (result.success && result.data) {
          form.reset(result.data);
        }
      } catch (error) {
        console.error("Error loading portal configuration:", error);
        setError("Error al cargar la configuración");
      } finally {
        setIsLoading(false);
      }
    };

    void loadData();
  }, [session, form]);

  useEffect(() => {
    const subscription = form.watch(() => {
      setHasUnsavedChanges(true);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = (data: PortalConfigurationInput) => {
    if (!accountId) {
      setError("No se pudo identificar la cuenta");
      return;
    }

    startTransition(async () => {
      try {
        setError(null);
        const result = await updatePortalConfigurationAction(accountId, data);

        if (result.success) {
          toast.success("Configuración guardada correctamente");
          setHasUnsavedChanges(false);
        } else {
          setError(result.error ?? "Error al guardar la configuración");
        }
      } catch (error) {
        console.error("Error updating portal configuration:", error);
        setError("Error inesperado al guardar la configuración");
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-[600px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!accountId) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Error al cargar la configuración</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex h-[600px] overflow-hidden rounded-2xl bg-white shadow-sm">
      {/* Sidebar Navigation */}
      <nav className="w-64 border-r border-gray-100 bg-gray-50/50">
        <div className="p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Configuración de Portales
          </h3>
        </div>
        
        <div className="space-y-1 px-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all",
                  isActive
                    ? "bg-white shadow-sm text-gray-900"
                    : "text-gray-600 hover:bg-white/60 hover:text-gray-900"
                )}
              >
                <Icon className={cn("h-4 w-4", item.color)} />
                <div className="flex-1 text-left">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-gray-500">{item.description}</div>
                </div>
                {isActive && <ChevronRight className="h-4 w-4 text-gray-400" />}
              </button>
            );
          })}
        </div>

        {/* Save Button in Sidebar */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-gray-50/50 p-4">
          {hasUnsavedChanges && (
            <div className="mb-2 flex items-center gap-1.5 text-xs text-amber-600">
              <div className="h-1.5 w-1.5 rounded-full bg-amber-600" />
              Cambios sin guardar
            </div>
          )}
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={isPending || !hasUnsavedChanges}
            className="w-full"
            size="sm"
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : hasUnsavedChanges ? (
              "Guardar cambios"
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Guardado
              </>
            )}
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <Form {...form}>
          <form className="p-8">
            {/* Fotocasa Section */}
            {activeSection === "fotocasa" && (
              <div className="space-y-6">
                <div>
                  <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                    <Globe className="h-5 w-5 text-orange-500" />
                    Fotocasa
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Configura la integración con el portal Fotocasa
                  </p>
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="fotocasa.enabled"
                    render={({ field }) => (
                      <FormItem className="rounded-lg border border-gray-100 p-6 transition-colors hover:border-gray-200">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <FormLabel className="text-base font-medium">
                              Publicación automática
                            </FormLabel>
                            <FormDescription className="text-sm text-gray-500">
                              Las propiedades se publicarán automáticamente en Fotocasa
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fotocasa.apiKey"
                    render={({ field }) => (
                      <FormItem className="rounded-lg border border-gray-100 p-6 transition-colors hover:border-gray-200">
                        <FormLabel className="flex items-center gap-2 text-base font-medium">
                          <Key className="h-4 w-4 text-gray-500" />
                          API Key
                        </FormLabel>
                        <FormDescription className="text-sm text-gray-500">
                          Introduce tu clave API de Fotocasa para conectar tu cuenta
                        </FormDescription>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            placeholder="••••••••••••••••"
                            className="font-mono"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                    <div className="text-sm text-gray-600">
                      Conecta tu cuenta de Fotocasa para empezar a publicar
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!form.watch("fotocasa.apiKey")}
                      onClick={() => {
                        // TODO: Implement activation logic
                        toast.success("Cuenta de Fotocasa activada correctamente");
                      }}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Activar
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Idealista Section */}
            {activeSection === "idealista" && (
              <div className="space-y-6">
                <div>
                  <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                    <Globe className="h-5 w-5 text-green-500" />
                    Idealista
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Configura la integración con el portal Idealista
                  </p>
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="idealista.enabled"
                    render={({ field }) => (
                      <FormItem className="rounded-lg border border-gray-100 p-6 transition-colors hover:border-gray-200">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <FormLabel className="text-base font-medium">
                              Publicación automática
                            </FormLabel>
                            <FormDescription className="text-sm text-gray-500">
                              Las propiedades se publicarán automáticamente en Idealista
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="idealista.apiKey"
                    render={({ field }) => (
                      <FormItem className="rounded-lg border border-gray-100 p-6 transition-colors hover:border-gray-200">
                        <FormLabel className="flex items-center gap-2 text-base font-medium">
                          <Key className="h-4 w-4 text-gray-500" />
                          API Key
                        </FormLabel>
                        <FormDescription className="text-sm text-gray-500">
                          Introduce tu clave API de Idealista para conectar tu cuenta
                        </FormDescription>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            placeholder="••••••••••••••••"
                            className="font-mono"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                    <div className="text-sm text-gray-600">
                      Conecta tu cuenta de Idealista para empezar a publicar
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!form.watch("idealista.apiKey")}
                      onClick={() => {
                        // TODO: Implement activation logic
                        toast.success("Cuenta de Idealista activada correctamente");
                      }}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Activar
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* General Section */}
            {activeSection === "general" && (
              <div className="space-y-6">
                <div>
                  <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                    <Settings className="h-5 w-5 text-gray-600" />
                    Configuración General
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Ajustes que aplican a todos los portales
                  </p>
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="general.watermarkEnabled"
                    render={({ field }) => (
                      <FormItem className="rounded-lg border border-gray-100 p-6 transition-colors hover:border-gray-200">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <FormLabel className="flex items-center gap-2 text-base font-medium">
                              <Droplet className="h-4 w-4 text-blue-500" />
                              Marca de agua
                            </FormLabel>
                            <FormDescription className="text-sm text-gray-500">
                              Añade tu logo como marca de agua en todas las imágenes
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive" className="mt-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </form>
        </Form>
      </div>
    </div>
  );
}
