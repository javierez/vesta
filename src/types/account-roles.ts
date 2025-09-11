export interface AccountRolePermissions {
  tasks?: {
    viewOwn: boolean;
    viewAll: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
  properties?: {
    viewOwn: boolean;
    viewAll: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    publish: boolean;
  };
  contacts?: {
    viewOwn: boolean;
    viewAll: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
  calendar?: {
    viewOwn: boolean;
    viewAll: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
  tools?: {
    imageStudio: boolean;
    aiTools: boolean;
    export: boolean;
  };
  admin?: {
    manageUsers: boolean;
    manageRoles: boolean;
    viewReports: boolean;
    manageAccount: boolean;
    manageBilling: boolean;
  };
}

export interface AccountRole {
  accountRoleId: number;
  roleId: number; // 1=Agente, 2=Superadmin, 3=Admin de Cuenta
  accountId: number;
  permissions: AccountRolePermissions;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export const ROLE_NAMES: Record<number, string> = {
  1: "Agente",
  2: "Superadmin",
  3: "Admin de Cuenta",
};

export const ROLE_DESCRIPTIONS: Record<number, string> = {
  1: "Acceso básico para agentes inmobiliarios",
  2: "Acceso administrativo avanzado",
  3: "Control total de la cuenta",
};

export const ROLE_COLORS: Record<number, string> = {
  1: "bg-slate-500",
  2: "bg-indigo-500",
  3: "bg-emerald-600",
};