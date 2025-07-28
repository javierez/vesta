"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import Image from "next/image";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
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
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Loader2, Building2 } from "lucide-react";
import { toast } from "sonner";
import {
  uploadAccountLogo,
  updateAccountSettingsAction,
  getAccountSettingsAction,
} from "~/app/actions/settings";
import type { AccountInput, AccountSettings } from "~/types/settings";

interface AccountSettingsProps {
  accountId: bigint;
  initialData?: AccountSettings;
}

export function AccountSettings({
  accountId,
  initialData,
}: AccountSettingsProps) {
  const [isPending, startTransition] = useTransition();
  const [isLogoUploading, setIsLogoUploading] = useState(false);
  const [currentLogo, setCurrentLogo] = useState<string | undefined>(
    initialData?.logo,
  );
  const [error, setError] = useState<string | null>(null);

  const form = useForm<AccountInput>({
    defaultValues: {
      name: initialData?.name ?? "",
      address: initialData?.address ?? "",
      phone: initialData?.phone ?? "",
      email: initialData?.email ?? "",
      website: initialData?.website ?? "",
    },
  });

  // Load account settings if not provided
  useEffect(() => {
    if (!initialData) {
      const loadAccountSettings = async () => {
        const result = await getAccountSettingsAction(accountId);
        if (result.success && result.data) {
          const data = result.data;
          form.reset({
            name: data.name,
            address: data.address ?? "",
            phone: data.phone ?? "",
            email: data.email ?? "",
            website: data.website ?? "",
          });
          setCurrentLogo(data.logo);
        }
      };
      void loadAccountSettings();
    }
  }, [accountId, initialData, form]);

  const onSubmit = (data: AccountInput) => {
    startTransition(async () => {
      try {
        setError(null);
        const result = await updateAccountSettingsAction(accountId, data);

        if (result.success) {
          toast.success("Configuración actualizada correctamente");
        } else {
          setError(result.error ?? "Error al actualizar la configuración");
        }
      } catch (error) {
        console.error("Error updating account settings:", error);
        setError("Error inesperado al actualizar la configuración");
      }
    });
  };

  const handleLogoUpload = async (file: File) => {
    setIsLogoUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("logo", file);
      formData.append("accountId", accountId.toString());

      const result = await uploadAccountLogo(formData);

      if (result.success && result.data) {
        setCurrentLogo(result.data.logo);
        toast.success("Logo actualizado correctamente");
      } else {
        setError(result.error ?? "Error al subir el logo");
      }
    } catch (error) {
      console.error("Error uploading logo:", error);
      setError("Error inesperado al subir el logo");
    } finally {
      setIsLogoUploading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("El archivo debe ser una imagen");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("El archivo no puede superar los 5MB");
        return;
      }

      void handleLogoUpload(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Logo Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Logo de la Organización
          </CardTitle>
          <CardDescription>
            Sube el logo de tu inmobiliaria. Se guardará en AWS S3 en la carpeta
            inmobiliariaacropolis.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentLogo && (
            <div className="flex items-center gap-4">
              <Image
                src={currentLogo}
                alt="Logo actual"
                className="h-16 w-16 rounded-lg border object-cover"
                width={64}
                height={64}
              />
              <div className="text-sm text-muted-foreground">Logo actual</div>
            </div>
          )}

          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isLogoUploading}
              className="max-w-xs"
            />
            {isLogoUploading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Subiendo logo...
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Formatos soportados: PNG, JPG, GIF. Tamaño máximo: 5MB.
          </p>
        </CardContent>
      </Card>

      {/* Account Information Form */}
      <Card>
        <CardHeader>
          <CardTitle>Información de la Cuenta</CardTitle>
          <CardDescription>
            Configura la información básica de tu inmobiliaria.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la Inmobiliaria</FormLabel>
                    <FormControl>
                      <Input placeholder="Inmobiliaria Acrópolis" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Calle Principal 123, Madrid, España"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Dirección completa de la oficina principal
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input placeholder="+34 666 777 888" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="info@inmobiliaria.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sitio Web</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://www.inmobiliaria.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
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
                Guardar Cambios
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
