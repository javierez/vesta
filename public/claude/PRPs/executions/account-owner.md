# Account Owner Admin Panel - Implementation PRP

## Overview
Create a new admin panel for account administrators (userRole=3) with similar navigation structure to the existing super admin panel, but with different functionalities focused on account-level configuration and management.

## Requirements Summary
- New admin tab in side navigation for users with role ID 3 (Account Admin)
- Admin page with menu sections: Reports, Configuration, Other (please give recommendations)
- Configuration section with Logo upload functionality
- Logo uploads should go to AWS S3 in `inmobiliariaAcropolis/config` folder
- Must not disrupt existing functionality (except side nav addition)

## Critical Context from Codebase Research

### 1. Existing Admin Implementation Pattern
The current super admin (role=2) implementation follows this pattern:
- **Route**: `/app/(dashboard)/admin/page.tsx`
- **Component**: `SuperAdminDashboard` with Tabs for different sections
- **Permission Check**: Uses `userHasRole(session.user.id, 2)` before rendering
- **Navigation**: Conditional rendering in `dashboard-layout.tsx` based on `hasRoleId(2)`

Reference files:
- `/src/app/(dashboard)/admin/page.tsx`: Main admin page structure
- `/src/components/admin/super-admin-dashboard.tsx`: Tab-based dashboard component
- `/src/components/layout/dashboard-layout.tsx`: Navigation with role-based rendering

### 2. Role Checking Pattern
The codebase uses:
```typescript
// From user-role-provider.tsx
const hasRoleId = (roleId: number) => {
  if (legacyRoles.includes(roleId)) {
    return true;
  }
  // Role mappings...
}
```

### 3. AWS S3 Upload Pattern
Existing upload functionality:
- Uses `@aws-sdk/client-s3` with `PutObjectCommand`
- Helper functions in `/src/lib/s3.ts`
- Server actions in `/src/app/actions/upload.ts`
- Settings-specific uploads in `/src/app/actions/settings.ts`

Key pattern for logo upload (from settings.ts):
```typescript
const { imageUrl } = await uploadImageToS3(
  file,
  "inmobiliariaacropolis", // Folder name
  1, // Order number
);
```

### 4. Account Settings Infrastructure
The codebase already has:
- `AccountSettings` type with `logo` field
- `updateAccountLogo` function in queries
- `uploadAccountLogo` action for handling logo uploads

## Implementation Blueprint

### Phase 1: Create Account Admin Route and Page

1. **Create new route**: `/src/app/(dashboard)/account-admin/page.tsx`
```typescript
// Similar structure to admin/page.tsx but checking for role ID 3
import { redirect } from "next/navigation";
import { auth } from "~/lib/auth";
import { userHasRole } from "~/server/queries/user-roles";
import { AccountAdminDashboard } from "~/components/admin/account-admin-dashboard";

export default async function AccountAdminPage() {
  const session = await auth.api.getSession({
    headers: await import("next/headers").then((m) => m.headers()),
  });

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Check if user has role ID 3 (Account Admin)
  const hasRequiredRole = await userHasRole(session.user.id, 3);

  if (!hasRequiredRole) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Administración de Cuenta</h1>
        <p className="mt-1 text-sm text-gray-500">
          Panel de administración para administradores de cuenta
        </p>
      </div>

      <AccountAdminDashboard />
    </div>
  );
}
```

### Phase 2: Update Navigation

2. **Update dashboard-layout.tsx**:
```typescript
// Add new navigation item
const accountAdminNavigation = [
  { name: "Administración", href: "/account-admin", icon: Shield },
];

// In the navigation building logic:
const navigation = [...baseNavigation];
if (hasRoleId(2)) {
  navigation.push(...adminNavigation);
}
// Add account admin navigation
if (hasRoleId(3)) {
  navigation.push(...accountAdminNavigation);
}
```

### Phase 3: Create Account Admin Dashboard Component

3. **Create**: `/src/components/admin/account-admin-dashboard.tsx`
```typescript
"use client";

import type { FC } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { AccountReports } from "./account-reports";
import { AccountConfiguration } from "./account-configuration";
import { AccountOther } from "./account-other";

export const AccountAdminDashboard: FC = () => {
  return (
    <Tabs defaultValue="reports" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="reports">Reportes</TabsTrigger>
        <TabsTrigger value="configuration">Configuración</TabsTrigger>
        <TabsTrigger value="other">Otros</TabsTrigger>
      </TabsList>

      <TabsContent value="reports" className="space-y-6">
        <AccountReports />
      </TabsContent>

      <TabsContent value="configuration" className="space-y-6">
        <AccountConfiguration />
      </TabsContent>

      <TabsContent value="other" className="space-y-6">
        <AccountOther />
      </TabsContent>
    </Tabs>
  );
};
```

### Phase 4: Implement Configuration Section with Logo Upload

4. **Create**: `/src/components/admin/account-configuration.tsx`
```typescript
"use client";

import { useState, useEffect } from "react";
import { useSession } from "~/lib/auth-client";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Upload } from "lucide-react";
import { 
  uploadAccountLogoForConfig, 
  getAccountSettingsAction,
  getCurrentUserAccountId 
} from "~/app/actions/settings";
import { useToast } from "~/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

export const AccountConfiguration = () => {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [accountId, setAccountId] = useState<bigint | null>(null);

  useEffect(() => {
    async function loadAccountData() {
      if (session?.user?.id) {
        const userAccountId = await getCurrentUserAccountId(session.user.id);
        if (userAccountId) {
          setAccountId(userAccountId);
          const settings = await getAccountSettingsAction(userAccountId);
          if (settings.success && settings.data?.logo) {
            setLogoUrl(settings.data.logo);
          }
        }
      }
    }
    void loadAccountData();
  }, [session]);

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !accountId) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("logo", file);
    formData.append("accountId", accountId.toString());

    try {
      const result = await uploadAccountLogoForConfig(formData);
      
      if (result.success && result.data?.logo) {
        setLogoUrl(result.data.logo);
        toast({
          title: "Logo actualizado",
          description: "El logo se ha actualizado correctamente",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Error al actualizar el logo",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al subir el logo",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Configuración de la Cuenta
        </h2>
        <p className="text-sm text-gray-500">
          Gestiona la configuración y personalización de tu cuenta
        </p>
      </div>

      <Tabs defaultValue="logo" className="space-y-6">
        <TabsList>
          <TabsTrigger value="logo">Logo</TabsTrigger>
          <TabsTrigger value="other">Otras Opciones</TabsTrigger>
        </TabsList>

        <TabsContent value="logo">
          <Card>
            <CardHeader>
              <CardTitle>Logo de la Empresa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {logoUrl && (
                <div className="mb-4">
                  <Label>Logo Actual</Label>
                  <div className="mt-2">
                    <img 
                      src={logoUrl} 
                      alt="Logo de la empresa" 
                      className="h-32 w-auto object-contain border rounded"
                    />
                  </div>
                </div>
              )}
              
              <div>
                <Label htmlFor="logo-upload">
                  {logoUrl ? "Cambiar Logo" : "Subir Logo"}
                </Label>
                <div className="mt-2 flex items-center gap-4">
                  <Input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={uploading || !accountId}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={uploading || !accountId}
                    onClick={() => document.getElementById("logo-upload")?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {uploading ? "Subiendo..." : "Seleccionar Imagen"}
                  </Button>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Formatos permitidos: PNG, JPG, JPEG. Tamaño máximo: 5MB
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="other">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">
                Más opciones de configuración estarán disponibles próximamente
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
```

### Phase 5: Create Supporting Components

5. **Create placeholder components**:

`/src/components/admin/account-reports.tsx`:
```typescript
"use client";

import { Card, CardContent } from "~/components/ui/card";
import { BarChart3 } from "lucide-react";

export const AccountReports = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Reportes</h2>
        <p className="text-sm text-gray-500">
          Visualiza estadísticas y reportes de tu cuenta
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BarChart3 className="mb-4 h-12 w-12 text-gray-400" />
          <p className="text-center text-gray-500">
            Los reportes estarán disponibles próximamente
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
```

`/src/components/admin/account-other.tsx`:
```typescript
"use client";

import { Card, CardContent } from "~/components/ui/card";
import { Settings } from "lucide-react";

export const AccountOther = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Otras Opciones</h2>
        <p className="text-sm text-gray-500">
          Funcionalidades adicionales para administradores de cuenta
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Settings className="mb-4 h-12 w-12 text-gray-400" />
          <p className="text-center text-gray-500">
            Más opciones estarán disponibles próximamente
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
```

### Phase 6: Update Settings Action for Config Folder

6. **Create new action**: `/src/app/actions/settings.ts` (add new function)
```typescript
// Add this new function specifically for config files
export async function uploadAccountLogoForConfig(
  formData: FormData,
): Promise<AccountSettingsResponse> {
  try {
    const file = formData.get("logo") as File;
    const accountId = formData.get("accountId") as string;

    if (!file || !accountId) {
      return {
        success: false,
        error: "Archivo y ID de cuenta requeridos",
      };
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return {
        success: false,
        error: "El archivo debe ser una imagen",
      };
    }

    // Create a custom upload function for the config folder
    const fileExtension = file.name.split(".").pop();
    const logoKey = `inmobiliariaAcropolis/configFiles/logo_${accountId}_${Date.now()}.${fileExtension}`;
    
    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to S3 directly with custom key
    const s3Client = new S3Client({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: logoKey,
        Body: buffer,
        ContentType: file.type,
      }),
    );

    const imageUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${logoKey}`;

    // Update account with new logo URL
    const updatedAccount = await updateAccountLogo(BigInt(accountId), imageUrl);

    // Revalidate pages
    revalidatePath("/account-admin");
    revalidatePath("/ajustes");

    return {
      success: true,
      data: updatedAccount,
    };
  } catch (error) {
    console.error("Error uploading account logo:", error);
    return {
      success: false,
      error: "Error al subir el logo",
    };
  }
}
```

## Implementation Tasks (In Order)

1. Create the account-admin route and page component
2. Update dashboard-layout.tsx to add navigation for role ID 3
3. Create AccountAdminDashboard component with tabs
4. Create AccountConfiguration component with logo upload
5. Create placeholder components (AccountReports, AccountOther)
6. Add uploadAccountLogoForConfig action to settings.ts
7. Test the complete flow

## Validation Gates

```bash
# Type checking
pnpm typecheck

# Linting with auto-fix
pnpm lint:fix

# Format code
pnpm format:write

# Build verification
pnpm build

# Manual testing checklist
echo "✓ Navigation shows for users with role ID 3"
echo "✓ Navigation doesn't show for other users"
echo "✓ Access control redirects non-authorized users"
echo "✓ Logo upload works and saves to correct S3 folder"
echo "✓ Logo displays after upload"
echo "✓ Tab navigation works correctly"
echo "✓ No disruption to existing admin functionality"
```

## Error Handling Strategy

1. **Permission Denied**: Redirect to /dashboard with appropriate messaging
2. **Upload Failures**: Show toast notifications with specific error messages
3. **S3 Errors**: Log to console and show user-friendly error message
4. **Missing Account ID**: Handle gracefully with loading states

## Security Considerations

1. Always verify role ID 3 server-side before rendering
2. Use server actions for all S3 operations
3. Validate file types and sizes on both client and server
4. Never expose AWS credentials to client
5. Use proper CORS configuration for S3 bucket

## References

- Existing admin implementation: `/src/app/(dashboard)/admin/page.tsx`
- Navigation pattern: `/src/components/layout/dashboard-layout.tsx`
- S3 upload utilities: `/src/lib/s3.ts`
- Settings infrastructure: `/src/types/settings.ts`, `/src/server/queries/settings.ts`
- Role checking: `/src/components/providers/user-role-provider.tsx`

## External Documentation

- AWS SDK v3 S3 Client: https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/s3/
- Next.js App Router: https://nextjs.org/docs/app
- Shadcn/ui Components: https://ui.shadcn.com/

## Success Criteria

- Account admins (role=3) can access their admin panel
- Logo upload saves to `inmobiliariaAcropolis/configFiles` folder
- No disruption to existing functionality
- Clean, consistent UI matching existing admin panel
- Proper error handling and user feedback

**Confidence Score: 9/10**

This PRP provides comprehensive context for implementing the account owner admin panel with all necessary patterns, references, and validation steps for successful one-pass implementation.