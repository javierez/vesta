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
import {
  Loader2,
  CreditCard,
  Building,
  Smartphone,
  Banknote,
} from "lucide-react";
import { toast } from "sonner";
import {
  updatePaymentSettingsAction,
  getAccountSettingsAction,
} from "~/app/actions/settings";
import { paymentSettingsSchema } from "~/types/settings";
import type { PaymentInput, AccountSettings } from "~/types/settings";

interface PaymentSettingsProps {
  accountId: bigint;
  initialData?: AccountSettings;
}

export function PaymentSettings({
  accountId,
  initialData,
}: PaymentSettingsProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Extract payment settings from account settings
  const paymentSettings = initialData?.paymentSettings ?? {};

  const form = useForm<PaymentInput>({
    resolver: zodResolver(paymentSettingsSchema),
    defaultValues: {
      stripeEnabled: (paymentSettings.stripeEnabled as boolean) ?? false,
      paypalEnabled: (paymentSettings.paypalEnabled as boolean) ?? false,
      bizumEnabled: (paymentSettings.bizumEnabled as boolean) ?? false,
      bankTransferEnabled:
        (paymentSettings.bankTransferEnabled as boolean) ?? true,
      defaultPaymentMethod:
        (paymentSettings.defaultPaymentMethod as PaymentInput["defaultPaymentMethod"]) ??
        "bank_transfer",
    },
  });

  // Load account settings if not provided
  useEffect(() => {
    if (!initialData) {
      const loadAccountSettings = async () => {
        const result = await getAccountSettingsAction(accountId);
        if (result.success && result.data) {
          const paymentSettings = result.data.paymentSettings ?? {};
          form.reset({
            stripeEnabled: (paymentSettings.stripeEnabled as boolean) ?? false,
            paypalEnabled: (paymentSettings.paypalEnabled as boolean) ?? false,
            bizumEnabled: (paymentSettings.bizumEnabled as boolean) ?? false,
            bankTransferEnabled:
              (paymentSettings.bankTransferEnabled as boolean) ?? true,
            defaultPaymentMethod:
              (paymentSettings.defaultPaymentMethod as PaymentInput["defaultPaymentMethod"]) ??
              "bank_transfer",
          });
        }
      };
      void loadAccountSettings();
    }
  }, [accountId, initialData, form]);

  const onSubmit = (data: PaymentInput) => {
    startTransition(async () => {
      try {
        setError(null);
        const result = await updatePaymentSettingsAction(accountId, data);

        if (result.success) {
          toast.success("Configuración de pagos actualizada correctamente");
        } else {
          setError(
            result.error ?? "Error al actualizar la configuración de pagos",
          );
        }
      } catch (error) {
        console.error("Error updating payment settings:", error);
        setError("Error inesperado al actualizar la configuración");
      }
    });
  };

  const paymentMethods = [
    {
      name: "Stripe",
      description: "Procesamiento de pagos con tarjeta de crédito y débito",
      field: "stripeEnabled" as const,
      icon: CreditCard,
      color: "text-purple-600",
      value: "stripe",
    },
    {
      name: "PayPal",
      description: "Pagos seguros a través de PayPal",
      field: "paypalEnabled" as const,
      icon: CreditCard,
      color: "text-blue-600",
      value: "paypal",
    },
    {
      name: "Bizum",
      description: "Pagos instantáneos entre particulares (España)",
      field: "bizumEnabled" as const,
      icon: Smartphone,
      color: "text-green-600",
      value: "bizum",
    },
    {
      name: "Transferencia Bancaria",
      description: "Transferencias bancarias tradicionales",
      field: "bankTransferEnabled" as const,
      icon: Building,
      color: "text-gray-600",
      value: "bank_transfer",
    },
  ];

  const defaultPaymentOptions = paymentMethods
    .filter((method) => form.watch(method.field))
    .map((method) => ({
      value: method.value,
      label: method.name,
    }));

  return (
    <div className="space-y-6">
      {/* Payment Methods Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Métodos de Pago
          </CardTitle>
          <CardDescription>
            Configura los métodos de pago disponibles para tus clientes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <FormField
                      key={method.field}
                      control={form.control}
                      name={method.field}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-3">
                              <Icon className={`h-5 w-5 ${method.color}`} />
                              <FormLabel className="text-base font-medium">
                                {method.name}
                              </FormLabel>
                            </div>
                            <FormDescription className="max-w-lg">
                              {method.description}
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
                  );
                })}
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
                Guardar Métodos de Pago
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Default Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5" />
            Método de Pago por Defecto
          </CardTitle>
          <CardDescription>
            Selecciona el método de pago que se mostrará por defecto a los
            clientes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="defaultPaymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Método por defecto</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={defaultPaymentOptions.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un método por defecto" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {defaultPaymentOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {defaultPaymentOptions.length === 0
                        ? "Habilita al menos un método de pago para seleccionar uno por defecto"
                        : "Este método se mostrará seleccionado cuando un cliente inicie un pago"}
                    </FormDescription>
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
                disabled={isPending || defaultPaymentOptions.length === 0}
                className="w-full md:w-auto"
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Método por Defecto
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Configuración</CardTitle>
          <CardDescription>
            Estado actual de la configuración de pagos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-sm">
              <strong>Métodos habilitados:</strong>
            </div>
            <div className="space-y-2">
              {paymentMethods.map((method) => {
                const isEnabled = form.watch(method.field);
                const Icon = method.icon;
                return (
                  <div
                    key={method.field}
                    className="flex items-center gap-3 text-sm"
                  >
                    <Icon
                      className={`h-4 w-4 ${isEnabled ? method.color : "text-gray-300"}`}
                    />
                    <span
                      className={
                        isEnabled ? "text-foreground" : "text-muted-foreground"
                      }
                    >
                      {method.name}:{" "}
                      {isEnabled ? "Habilitado" : "Deshabilitado"}
                    </span>
                  </div>
                );
              })}
            </div>

            {defaultPaymentOptions.length > 0 && (
              <div className="border-t pt-3">
                <div className="text-sm">
                  <strong>Método por defecto:</strong>{" "}
                  <span className="text-muted-foreground">
                    {
                      defaultPaymentOptions.find(
                        (option) =>
                          option.value === form.watch("defaultPaymentMethod"),
                      )?.label
                    }
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
