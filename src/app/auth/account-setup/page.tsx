"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { AlertCircle, CheckCircle } from "lucide-react";
import { validateInvitationCode } from "~/app/actions/accounts";
import { updateUserAccount } from "~/app/actions/user-account";
import { assignUserRole } from "~/app/actions/user-roles";
import { useSession } from "~/lib/auth-client";

export default function AccountSetupPage() {
  const [inviteCode, setInviteCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const router = useRouter();
  const { data: session } = useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!inviteCode.trim()) {
      setError("El código de invitación es obligatorio");
      setIsLoading(false);
      return;
    }

    // Validate invitation code
    const accountId = parseInt(inviteCode);
    if (isNaN(accountId)) {
      setError("El código de invitación debe ser un número válido");
      setIsLoading(false);
      return;
    }

    try {
      // Validate the invitation code
      const validation = await validateInvitationCode(accountId);
      if (!validation.isValid) {
        setError(validation.message);
        setIsLoading(false);
        return;
      }

      if (!session?.user?.id) {
        setError("No se pudo obtener la información del usuario");
        setIsLoading(false);
        return;
      }

      // Update user's accountId
      const updateResult = await updateUserAccount(session.user.id, accountId);
      if (!updateResult.success) {
        setError(updateResult.error ?? "Error al asignar la cuenta");
        setIsLoading(false);
        return;
      }

      // Assign default agent role (roleId = 1)
      try {
        await assignUserRole(session.user.id, 1);
      } catch (roleError) {
        console.error("Failed to assign role:", roleError);
        // Don't fail the process if role assignment fails
      }

      setSuccess(true);

      // Redirect to dashboard after successful setup
      setTimeout(() => {
        window.location.href = "/operaciones";
      }, 2000);
    } catch (err) {
      setError("Error inesperado al configurar la cuenta");
      console.error("Account setup error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Card>
            <CardContent className="py-8 text-center">
              <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
              <h2 className="mb-2 text-2xl font-bold text-gray-900">
                ¡Cuenta configurada exitosamente!
              </h2>
              <p className="mb-4 text-gray-600">
                Te estamos redirigiendo al dashboard...
              </p>
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Vesta CRM</h1>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">
            Configuración de Cuenta
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Para continuar, necesitas asociar tu usuario con una cuenta de organización
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Código de Invitación</CardTitle>
            <CardDescription>
              Ingresa el código de invitación proporcionado por tu administrador
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {session?.user && (
              <div className="rounded-md bg-blue-50 p-4">
                <p className="text-sm text-blue-800">
                  Conectado como: <strong>{session.user.email}</strong>
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="inviteCode">Código de Invitación</Label>
                <Input
                  id="inviteCode"
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  required
                  disabled={isLoading}
                  placeholder="Ingresa tu código de invitación"
                  className="mt-1"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Este código te fue proporcionado por el administrador de tu organización
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Configurando cuenta..." : "Configurar Cuenta"}
              </Button>
            </form>

            <div className="text-center text-sm text-gray-500">
              <p>
                Si no tienes un código de invitación, contacta a tu administrador
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}