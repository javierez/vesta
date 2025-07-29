"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Building2, User, Globe, CreditCard } from "lucide-react";
import { AccountSettings } from "./account-settings";
import { UserSettings } from "./user-settings";
import { PortalSettings } from "./portal-settings";
import { PaymentSettings } from "./payment-settings";
import {
  getAccountSettingsAction,
  getUserSettingsAction,
  getCurrentUserAccountId,
} from "~/app/actions/settings";
import type {
  AccountSettings as AccountSettingsType,
  UserSettings as UserSettingsType,
  SettingsTab,
  SettingsTabConfig,
} from "~/types/settings";

interface SettingsTabsProps {
  defaultTab?: SettingsTab;
  userId: string; // Changed to string for Better Auth compatibility
}

export function SettingsTabs({
  defaultTab = "account",
  userId,
}: SettingsTabsProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>(defaultTab);
  const [accountData, setAccountData] = useState<AccountSettingsType | null>(
    null,
  );
  const [userData, setUserData] = useState<UserSettingsType | null>(null);
  const [accountId, setAccountId] = useState<bigint | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Tab configuration
  const tabsConfig: SettingsTabConfig[] = [
    {
      id: "account",
      label: "Cuenta",
      description: "Configuración de la inmobiliaria y logo",
      icon: Building2,
    },
    {
      id: "user",
      label: "Usuario",
      description: "Preferencias personales",
      icon: User,
    },
    {
      id: "portals",
      label: "Portales",
      description: "Configuración de publicación",
      icon: Globe,
    },
    {
      id: "payments",
      label: "Pagos",
      description: "Métodos de pago",
      icon: CreditCard,
    },
  ];

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // Get account ID for the user
        const userAccountId = await getCurrentUserAccountId(userId);
        if (!userAccountId) {
          console.error("No account ID found for user");
          return;
        }
        setAccountId(userAccountId);

        // Load account and user settings in parallel
        const [accountResult, userResult] = await Promise.all([
          getAccountSettingsAction(userAccountId),
          getUserSettingsAction(userId),
        ]);

        if (accountResult.success) {
          setAccountData(accountResult.data ?? null);
        }

        if (userResult.success) {
          setUserData(userResult.data ?? null);
        }
      } catch (error) {
        console.error("Error loading settings data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void loadData();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-muted-foreground">Cargando configuración...</div>
        </div>
      </div>
    );
  }

  if (!accountId) {
    return (
      <div className="space-y-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-muted-foreground">
            Error al cargar la configuración
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as SettingsTab)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-4">
          {tabsConfig.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center gap-2 text-sm"
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <div className="mt-6">
          {/* Tab descriptions */}
          <div className="mb-6">
            {tabsConfig.map((tab) => (
              <div
                key={tab.id}
                className={`${activeTab === tab.id ? "block" : "hidden"}`}
              >
                <div className="border-l-4 border-primary pl-4">
                  <h2 className="text-lg font-semibold">{tab.label}</h2>
                  <p className="text-sm text-muted-foreground">
                    {tab.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Tab content */}
          <TabsContent value="account" className="space-y-6">
            <AccountSettings
              accountId={accountId}
              initialData={accountData ?? undefined}
            />
          </TabsContent>

          <TabsContent value="user" className="space-y-6">
            <UserSettings userId={userId} initialData={userData ?? undefined} />
          </TabsContent>

          <TabsContent value="portals" className="space-y-6">
            <PortalSettings
              accountId={accountId}
              initialData={accountData ?? undefined}
            />
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <PaymentSettings
              accountId={accountId}
              initialData={accountData ?? undefined}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
