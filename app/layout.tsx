import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { MantineProvider } from "@mantine/core"
import { Notifications } from "@mantine/notifications"
import { ModalsProvider } from "@mantine/modals"
import { theme } from "@/shared/ui/mantine/theme"
import { QueryProvider } from "@/shared/lib/api/query-provider"
import { AuthProvider } from "@/features/auth/ui/auth-provider"
import "./globals.css"
import "@mantine/core/styles.css"
import "@mantine/dates/styles.css"
import "@mantine/notifications/styles.css"
import "@mantine/spotlight/styles.css"
import "@mantine/dropzone/styles.css"
import "@mantine/carousel/styles.css"
import "@mantine/charts/styles.css"
import "@mantine/code-highlight/styles.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Автозапчасти АСО",
  description: "Интернет-магазин автозапчастей",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <QueryProvider>
          <MantineProvider theme={theme}>
            <ModalsProvider>
              <Notifications />
              <AuthProvider>
                {children}
              </AuthProvider>
            </ModalsProvider>
          </MantineProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
