"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Shield, Users, Eye, Edit, Trash2, ImageIcon, Calendar, ChevronRight } from "lucide-react";
import { ROLE_NAMES, ROLE_DESCRIPTIONS, ROLE_COLORS, type AccountRole, type AccountRolePermissions } from "~/types/account-roles";
import { upsertAccountRolePermissionsWithAuth } from "~/server/queries/account-roles";

type Permission = {
  id: string;
  category: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
};

const permissions: Permission[] = [
  {
    id: "viewAll",
    category: "tasks",
    name: "Ver todas las tareas",
    description: "Puede ver todas las tareas del equipo",
    icon: Eye,
  },
  {
    id: "editOwn",
    category: "tasks",
    name: "Editar mis tareas",
    description: "Puede editar sus propias tareas",
    icon: Edit,
  },
  {
    id: "editAll",
    category: "tasks",
    name: "Editar todas las tareas",
    description: "Puede editar todas las tareas del equipo",
    icon: Edit,
  },
  {
    id: "deleteOwn",
    category: "tasks",
    name: "Eliminar mis tareas",
    description: "Puede eliminar sus propias tareas",
    icon: Trash2,
  },
  {
    id: "deleteAll",
    category: "tasks",
    name: "Eliminar todas las tareas",
    description: "Puede eliminar todas las tareas del equipo",
    icon: Trash2,
  },
  {
    id: "create",
    category: "properties",
    name: "Crear propiedades",
    description: "Puede crear nuevas propiedades",
    icon: Edit,
  },
  {
    id: "edit",
    category: "properties",
    name: "Editar propiedades",
    description: "Puede editar propiedades existentes",
    icon: Edit,
  },
  {
    id: "delete",
    category: "properties",
    name: "Eliminar propiedades",
    description: "Puede eliminar propiedades",
    icon: Trash2,
  },
  {
    id: "publish",
    category: "properties",
    name: "Publicar propiedades",
    description: "Puede publicar propiedades en portales",
    icon: Eye,
  },
  {
    id: "viewOwn",
    category: "contacts",
    name: "Ver contactos propios",
    description: "Solo puede ver sus propios contactos",
    icon: Eye,
  },
  {
    id: "viewAll",
    category: "contacts",
    name: "Ver todos los contactos",
    description: "Puede ver todos los contactos",
    icon: Eye,
  },
  {
    id: "edit",
    category: "contacts",
    name: "Editar contactos",
    description: "Puede editar y eliminar contactos",
    icon: Edit,
  },
  {
    id: "delete",
    category: "contacts",
    name: "Eliminar contactos",
    description: "Puede eliminar contactos",
    icon: Trash2,
  },
  {
    id: "imageStudio",
    category: "tools",
    name: "Usar Image Studio",
    description: "Acceso al estudio de imágenes para edición",
    icon: ImageIcon,
  },
  {
    id: "viewAll",
    category: "calendar",
    name: "Ver todo el calendario",
    description: "Puede ver eventos de todos los agentes",
    icon: Calendar,
  },
  {
    id: "create",
    category: "calendar",
    name: "Gestionar calendario",
    description: "Puede crear y modificar eventos del calendario",
    icon: Calendar,
  },
];

const categoryLabels: Record<string, string> = {
  tasks: "Tareas",
  properties: "Propiedades",
  contacts: "Contactos",
  calendar: "Calendario",
  tools: "Herramientas",
  admin: "Administración",
};

interface Props {
  initialRoles: AccountRole[];
}

export default function PrivacyPermissionsClient({ initialRoles }: Props) {
  // Set initial selected role to the first available role, fallback to 1
  const [selectedRoleId, setSelectedRoleId] = useState<number>(
    initialRoles.length > 0 ? initialRoles[0]!.roleId : 1
  );
  const [roles, setRoles] = useState<AccountRole[]>(initialRoles);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);


  const selectedRole = roles.find(r => r.roleId === selectedRoleId);

  const handlePermissionToggle = (category: string, permissionKey: string) => {
    if (!selectedRole || selectedRole.roleId === 3) return; // Admin de Cuenta has all permissions

    setRoles(prevRoles => {
      return prevRoles.map(role => {
        if (role.roleId !== selectedRoleId) return role;

        const updatedPermissions = { ...role.permissions };
        
        // Ensure category exists as an object
        if (!updatedPermissions[category as keyof AccountRolePermissions] || 
            typeof updatedPermissions[category as keyof AccountRolePermissions] !== 'object') {
          (updatedPermissions as Record<string, Record<string, boolean>>)[category] = {};
        }
        
        const categoryPerms = { ...updatedPermissions[category as keyof AccountRolePermissions] };
        
        // Toggle the permission
        (categoryPerms as Record<string, boolean>)[permissionKey] = !(categoryPerms as Record<string, boolean>)[permissionKey];
        (updatedPermissions as Record<string, Record<string, boolean>>)[category] = categoryPerms;


        return { ...role, permissions: updatedPermissions };
      });
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Use upsert to insert new roles or update existing ones
      for (const role of roles) {
        await upsertAccountRolePermissionsWithAuth(role.roleId, role.permissions);
      }
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving permissions:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setRoles(initialRoles);
    setHasChanges(false);
  };

  const groupedPermissions = permissions.reduce((acc, permission) => {
    acc[permission.category] ??= [];
    acc[permission.category]!.push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Roles y Privacidad
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Configura los permisos de acceso para cada rol en tu organización
          </p>
        </div>
        <div className="flex gap-2">
          {hasChanges && (
            <>
              <Button variant="outline" onClick={handleReset} disabled={saving}>
                Descartar cambios
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Guardando..." : "Guardar cambios"}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Roles Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Roles
              </CardTitle>
              <CardDescription>
                Selecciona un rol para configurar sus permisos
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {roles.map((role) => (
                  <button
                    key={role.roleId}
                    onClick={() => setSelectedRoleId(role.roleId)}
                    className={`w-full px-4 py-4 text-left transition-colors hover:bg-gray-50 ${
                      selectedRoleId === role.roleId ? "bg-gray-50" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {role.roleId !== 4 && (
                          <div className={`h-2 w-2 rounded-full ${ROLE_COLORS[role.roleId] ?? "bg-blue-500"}`} />
                        )}
                        <div className={role.roleId === 4 ? "ml-5" : ""}>
                          <p className="font-medium text-gray-900">{ROLE_NAMES[role.roleId] ?? `Role ${role.roleId}`}</p>
                          <p className="text-sm text-gray-500">{ROLE_DESCRIPTIONS[role.roleId] ?? "Custom role"}</p>
                        </div>
                      </div>
                      {selectedRoleId === role.roleId && (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Permissions Configuration */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Configuración de Permisos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">Todos</TabsTrigger>
                  <TabsTrigger value="properties">Propiedades</TabsTrigger>
                  <TabsTrigger value="contacts">Contactos</TabsTrigger>
                  <TabsTrigger value="tools">Herramientas</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-6 space-y-6">
                  {Object.entries(groupedPermissions).map(([category, perms]) => (
                    <div key={category} className="space-y-4">
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        {categoryLabels[category] ?? category}
                      </h3>
                      <div className="space-y-3">
                        {perms.map((permission) => {
                          const Icon = permission.icon;
                          const categoryPerms = selectedRole?.permissions[category as keyof AccountRolePermissions];
                          const isEnabled = categoryPerms && typeof categoryPerms === 'object' 
                            ? (categoryPerms as Record<string, boolean>)[permission.id] === true 
                            : false;

                          
                          return (
                            <div
                              key={`${category}-${permission.id}`}
                              className="group flex items-center justify-between py-4 px-1 border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <Icon className={`h-5 w-5 ${isEnabled ? "text-slate-600" : "text-gray-400"}`} />
                                <div>
                                  <Label 
                                    htmlFor={`${category}-${permission.id}`} 
                                    className="text-sm font-medium text-gray-900 cursor-pointer block"
                                  >
                                    {permission.name}
                                  </Label>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {permission.description}
                                  </p>
                                </div>
                              </div>
                              <Switch
                                id={`${category}-${permission.id}`}
                                checked={isEnabled}
                                onCheckedChange={() => handlePermissionToggle(category, permission.id)}
                                disabled={selectedRoleId === 3}
                                className="data-[state=checked]:bg-slate-600"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </TabsContent>

                {["properties", "contacts", "tools"].map((tab) => (
                  <TabsContent key={tab} value={tab} className="mt-6 space-y-4">
                    {groupedPermissions[tab]?.map((permission) => {
                      const Icon = permission.icon;
                      const categoryPerms = selectedRole?.permissions[tab as keyof AccountRolePermissions];
                      const isEnabled = categoryPerms && typeof categoryPerms === 'object' 
                        ? (categoryPerms as Record<string, boolean>)[permission.id] === true 
                        : false;
                      
                      return (
                        <div
                          key={`${tab}-${permission.id}`}
                          className="group flex items-center justify-between py-4 px-1 border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={`h-5 w-5 ${isEnabled ? "text-slate-600" : "text-gray-400"}`} />
                            <div>
                              <Label 
                                htmlFor={`${tab}-${permission.id}`} 
                                className="text-sm font-medium text-gray-900 cursor-pointer block"
                              >
                                {permission.name}
                              </Label>
                              <p className="text-xs text-gray-500 mt-1">
                                {permission.description}
                              </p>
                            </div>
                          </div>
                          <Switch
                            id={`${tab}-${permission.id}`}
                            checked={isEnabled}
                            onCheckedChange={() => handlePermissionToggle(tab, permission.id)}
                            disabled={selectedRoleId === 3}
                            className="data-[state=checked]:bg-slate-600"
                          />
                        </div>
                      );
                    })}
                  </TabsContent>
                ))}
              </Tabs>

              {selectedRoleId === 3 && (
                <div className="mt-6 rounded-lg bg-green-50 border border-green-200 p-4">
                  <p className="text-sm text-green-800">
                    <strong>Nota:</strong> El rol de Admin de Cuenta tiene acceso completo a todas las funcionalidades y no puede ser restringido.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}