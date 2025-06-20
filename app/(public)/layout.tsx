"use client"

import { AppShell } from "@mantine/core"
import { Header } from "@/widgets/header/ui"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppShell
      header={{ height: 60 }}
      padding="md"
    >
      <Header />
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  )
}