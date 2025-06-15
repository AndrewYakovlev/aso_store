import { PanelLayout } from "@/widgets/panel-layout/ui"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <PanelLayout>{children}</PanelLayout>
}