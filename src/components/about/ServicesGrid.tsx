"use client";

import { Card, CardContent } from "~/components/ui/card";
import {
  Map,
  User,
  MessageSquare,
  Handshake,
  Megaphone,
  HelpCircle,
} from "lucide-react";

interface Service {
  title: string;
  icon: string;
}

interface ServicesGridProps {
  services: Service[];
  title: string;
  maxServicesDisplayed: number;
}

const iconComponents = {
  map: Map,
  user: User,
  "message-square": MessageSquare,
  handshake: Handshake,
  megaphone: Megaphone,
  "help-circle": HelpCircle,
};

export function ServicesGrid({
  services,
  title,
  maxServicesDisplayed,
}: ServicesGridProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-semibold">{title}</h3>
      <div className="grid grid-cols-2 gap-4">
        {services.slice(0, maxServicesDisplayed).map((service, index) => {
          const IconComponent =
            iconComponents[service.icon as keyof typeof iconComponents];
          return (
            <Card
              key={index}
              className="border-none shadow-sm transition-shadow hover:shadow-md"
            >
              <CardContent className="flex items-center gap-3 p-4">
                <div className="rounded-full bg-primary/10 p-2">
                  <IconComponent className="h-5 w-5 text-primary" />
                </div>
                <span className="font-medium">{service.title}</span>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
