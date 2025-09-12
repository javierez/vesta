"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import Image from "next/image";
import { useSession } from "~/lib/auth-client";
import {
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  CreditCard,
  Settings,
  Shield,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Skeleton } from "~/components/ui/skeleton";
import {
  getAccountDetailsAction,
  getCurrentUserAccountId,
} from "~/app/actions/account-settings";

// Simple date formatting function
const formatDate = (date: Date | string, includeTime = false) => {
  const d = new Date(date);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...(includeTime && { hour: "2-digit", minute: "2-digit" }),
  };
  return d.toLocaleDateString("es-ES", options);
};

interface AccountDetails {
  accountId: string;
  name: string;
  shortName: string | null;
  legalName: string | null;
  logo: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  taxId: string | null;
  registryDetails: string | null;
  legalEmail: string | null;
  jurisdiction: string | null;
  privacyEmail: string | null;
  dpoEmail: string | null;
  portalSettings: Record<string, unknown>;
  paymentSettings: Record<string, unknown>;
  preferences: Record<string, unknown>;
  plan: string;
  subscriptionType: string | null;
  subscriptionStatus: string;
  subscriptionStartDate: Date | null;
  subscriptionEndDate: Date | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export function AccountDetails() {
  const { data: session } = useSession();
  const [accountDetails, setAccountDetails] = useState<AccountDetails | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadAccountDetails = useCallback(() => {
    startTransition(async () => {
      try {
        setError(null);
        const accountId = await getCurrentUserAccountId(session!.user.id);

        if (!accountId) {
          setError("No se pudo obtener la información de la cuenta");
          setLoading(false);
          return;
        }

        const result = await getAccountDetailsAction(accountId);

        if (result.success && result.data) {
          setAccountDetails(result.data);
        } else {
          setError(result.error ?? "Error al cargar los detalles de la cuenta");
        }
      } catch (error) {
        console.error("Error loading account details:", error);
        setError("Error inesperado al cargar los detalles de la cuenta");
      } finally {
        setLoading(false);
      }
    });
  }, [session]);

  useEffect(() => {
    if (session?.user?.id) {
      loadAccountDetails();
    }
  }, [session?.user?.id, loadAccountDetails]);

  if (loading || isPending) {
    return <AccountDetailsSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!accountDetails) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No se encontraron detalles de la cuenta
        </AlertDescription>
      </Alert>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: {
        label: "Activo",
        variant: "default" as const,
        icon: CheckCircle,
      },
      inactive: {
        label: "Inactivo",
        variant: "secondary" as const,
        icon: XCircle,
      },
      suspended: {
        label: "Suspendido",
        variant: "destructive" as const,
        icon: AlertCircle,
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] ||
      statusConfig.inactive;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getPlanBadge = (plan: string) => {
    const planConfig = {
      basic: { label: "Básico", variant: "secondary" as const },
      pro: { label: "Profesional", variant: "default" as const },
      enterprise: { label: "Empresarial", variant: "default" as const },
    };

    const config = planConfig[plan as keyof typeof planConfig] || {
      label: plan,
      variant: "outline" as const,
    };

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {accountDetails.logo && (
                <Image
                  src={accountDetails.logo}
                  alt={accountDetails.name}
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-lg object-contain"
                />
              )}
              <div>
                <CardTitle className="text-2xl">
                  {accountDetails.name}
                </CardTitle>
                {accountDetails.shortName && (
                  <p className="text-sm text-muted-foreground">
                    {accountDetails.shortName}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {getStatusBadge(accountDetails.status)}
              {getPlanBadge(accountDetails.plan)}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Información de Contacto
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              Dirección
            </p>
            <p className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
              {accountDetails.address ?? "No especificada"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              Teléfono
            </p>
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              {accountDetails.phone ?? "No especificado"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              {accountDetails.email ?? "No especificado"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              Sitio Web
            </p>
            <p className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              {accountDetails.website ? (
                <a
                  href={accountDetails.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {accountDetails.website}
                </a>
              ) : (
                "No especificado"
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Legal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Información Legal
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              Razón Social
            </p>
            <p>{accountDetails.legalName ?? "No especificada"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">CIF/NIF</p>
            <p>{accountDetails.taxId ?? "No especificado"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              Email Legal
            </p>
            <p>{accountDetails.legalEmail ?? "No especificado"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              Jurisdicción
            </p>
            <p>{accountDetails.jurisdiction ?? "No especificada"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              Email Privacidad
            </p>
            <p>{accountDetails.privacyEmail ?? "No especificado"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              Email DPO
            </p>
            <p>{accountDetails.dpoEmail ?? "No especificado"}</p>
          </div>
          {accountDetails.registryDetails && (
            <div className="col-span-2 space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Datos Registrales
              </p>
              <p className="text-sm">{accountDetails.registryDetails}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscription Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Información de Suscripción
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Plan</p>
            <div>{getPlanBadge(accountDetails.plan)}</div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              Estado de Suscripción
            </p>
            <div>{getStatusBadge(accountDetails.subscriptionStatus)}</div>
          </div>
          {accountDetails.subscriptionType && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Tipo de Suscripción
              </p>
              <p>{accountDetails.subscriptionType}</p>
            </div>
          )}
          {accountDetails.subscriptionStartDate && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Fecha de Inicio
              </p>
              <p>{formatDate(accountDetails.subscriptionStartDate)}</p>
            </div>
          )}
          {accountDetails.subscriptionEndDate && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Fecha de Fin
              </p>
              <p>{formatDate(accountDetails.subscriptionEndDate)}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Settings and Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuraciones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Portal Settings */}
          {Object.keys(accountDetails.portalSettings).length > 0 && (
            <div>
              <h4 className="mb-2 font-medium">Configuración de Portales</h4>
              <div className="grid gap-2 sm:grid-cols-2">
                {Object.entries(accountDetails.portalSettings).map(
                  ([portal, settings]) => (
                    <div
                      key={portal}
                      className="flex items-center justify-between rounded bg-gray-50 p-2"
                    >
                      <span className="capitalize">{portal}</span>
                      {typeof settings === "object" &&
                        settings !== null &&
                        "enabled" in settings && (
                          <Badge
                            variant={
                              (settings as { enabled: boolean }).enabled
                                ? "default"
                                : "secondary"
                            }
                          >
                            {(settings as { enabled: boolean }).enabled
                              ? "Activo"
                              : "Inactivo"}
                          </Badge>
                        )}
                    </div>
                  ),
                )}
              </div>
            </div>
          )}

          {/* Preferences */}
          {Object.keys(accountDetails.preferences).length > 0 && (
            <div>
              <h4 className="mb-2 font-medium">Preferencias</h4>
              <div className="space-y-2">
                {accountDetails.preferences.colorPalette &&
                Array.isArray(accountDetails.preferences.colorPalette) ? (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Paleta de Colores
                    </p>
                    <div className="mt-1 flex gap-2">
                      {(
                        accountDetails.preferences.colorPalette as string[]
                      ).map((color: string, index: number) => (
                        <div
                          key={index}
                          className="h-8 w-8 rounded border"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timestamps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Información del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              Fecha de Creación
            </p>
            <p>{formatDate(accountDetails.createdAt, true)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              Última Actualización
            </p>
            <p>{formatDate(accountDetails.updatedAt, true)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              ID de Cuenta
            </p>
            <p className="font-mono text-sm">{accountDetails.accountId}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              Estado de la Cuenta
            </p>
            <div>
              {accountDetails.isActive
                ? getStatusBadge("active")
                : getStatusBadge("inactive")}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AccountDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
        </CardHeader>
      </Card>

      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
