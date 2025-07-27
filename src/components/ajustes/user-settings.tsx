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
  FormMessage,
} from "~/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Loader2, Globe, Bell } from "lucide-react";
import { toast } from "sonner";
import {
  updateUserSettingsAction,
  getUserSettingsAction,
} from "~/app/actions/settings";
import { userSettingsSchema } from "~/types/settings";
import type { UserInput, UserSettings } from "~/types/settings";

interface UserSettingsProps {
  userId: bigint;
  initialData?: UserSettings;
}

export function UserSettings({ userId, initialData }: UserSettingsProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<UserInput>({
    resolver: zodResolver(userSettingsSchema),
    defaultValues: {
      language: initialData?.language ?? "es",
      theme: initialData?.theme ?? "system",
      notifications: initialData?.notifications ?? true,
      emailNotifications: initialData?.emailNotifications ?? true,
    },
  });

  // Load user settings if not provided
  useEffect(() => {
    if (!initialData) {
      const loadUserSettings = async () => {
        const result = await getUserSettingsAction(userId);
        if (result.success && result.data) {
          const data = result.data;
          form.reset({
            language: data.language,
            theme: data.theme,
            notifications: data.notifications,
            emailNotifications: data.emailNotifications,
          });
        }
      };
      void loadUserSettings();
    }
  }, [userId, initialData, form]);

  const onSubmit = (data: UserInput) => {
    startTransition(async () => {
      try {
        setError(null);
        const result = await updateUserSettingsAction(userId, data);

        if (result.success) {
          toast.success("Preferencias actualizadas correctamente");
        } else {
          setError(result.error ?? "Error al actualizar las preferencias");
        }
      } catch (error) {
        console.error("Error updating user settings:", error);
        setError("Error inesperado al actualizar las preferencias");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Language and Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Idioma y Apariencia
          </CardTitle>
          <CardDescription>
            Configura tu idioma preferido y el tema de la aplicación.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Idioma</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un idioma" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="es">Español</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Idioma de la interfaz de usuario
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="theme"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tema</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un tema" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="light">Claro</SelectItem>
                          <SelectItem value="dark">Oscuro</SelectItem>
                          <SelectItem value="system">Sistema</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Apariencia de la aplicación
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                Guardar Preferencias
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificaciones
          </CardTitle>
          <CardDescription>
            Gestiona cómo y cuándo quieres recibir notificaciones.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="notifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Notificaciones en la aplicación
                        </FormLabel>
                        <FormDescription>
                          Recibe notificaciones dentro de la aplicación sobre
                          nuevas citas, mensajes y actualizaciones.
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

                <FormField
                  control={form.control}
                  name="emailNotifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Notificaciones por email
                        </FormLabel>
                        <FormDescription>
                          Recibe resúmenes semanales y notificaciones
                          importantes por correo electrónico.
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
                Guardar Notificaciones
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
