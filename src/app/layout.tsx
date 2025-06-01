import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { DashboardLayout } from "~/components/layout/dashboard-layout"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Vesta CRM - Real Estate Management System",
  description: "A comprehensive CRM system for real estate professionals",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <DashboardLayout>{children}</DashboardLayout>
      </body>
    </html>
  )
}
