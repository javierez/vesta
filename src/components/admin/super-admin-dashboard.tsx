"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { AccountsManagement } from "./accounts-management";
import { UsersManagement } from "./users-management";
import { SystemSettings } from "./system-settings";

export function SuperAdminDashboard() {
  return (
    <Tabs defaultValue="accounts" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="accounts">Cuentas</TabsTrigger>
        <TabsTrigger value="users">Usuarios</TabsTrigger>
        <TabsTrigger value="settings">Configuración</TabsTrigger>
      </TabsList>
      
      <TabsContent value="accounts" className="space-y-6">
        <AccountsManagement />
      </TabsContent>
      
      <TabsContent value="users" className="space-y-6">
        <UsersManagement />
      </TabsContent>
      
      <TabsContent value="settings" className="space-y-6">
        <SystemSettings />
      </TabsContent>
    </Tabs>
  );
}