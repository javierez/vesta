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
