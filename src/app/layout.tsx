import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { UserRoleProvider } from "~/components/providers/user-role-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vesta CRM - Real Estate Management System",
  description: "A comprehensive CRM system for real estate professionals",
  appleWebApp: {
    capable: true,
    title: "Vesta CRM",
    statusBarStyle: "default",
  },
  icons: {
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Vesta CRM" />
      </head>
      <body className={inter.className}>
        <UserRoleProvider>{children}</UserRoleProvider>
      </body>
    </html>
  );
}
