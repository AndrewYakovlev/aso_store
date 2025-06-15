"use client"

import { AppShell, Navbar, ScrollArea, Text, UnstyledButton, Group, rem } from "@mantine/core"
import {
  IconHome,
  IconUsers,
  IconShoppingCart,
  IconPackage,
  IconCategory,
  IconCar,
  IconPercentage,
  IconMessageCircle,
  IconChartBar,
  IconSettings,
} from "@tabler/icons-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import classes from "./navigation.module.css"

const navItems = [
  { icon: IconHome, label: "Главная", href: "/panel" },
  { icon: IconUsers, label: "Пользователи", href: "/panel/users" },
  { icon: IconShoppingCart, label: "Заказы", href: "/panel/orders" },
  { icon: IconCategory, label: "Категории", href: "/panel/categories" },
  { icon: IconPackage, label: "Товары", href: "/panel/products" },
  { icon: IconCar, label: "Автомобили", href: "/panel/vehicles" },
  { icon: IconPercentage, label: "Скидки", href: "/panel/discounts" },
  { icon: IconMessageCircle, label: "Чаты", href: "/panel/chats" },
  { icon: IconChartBar, label: "Аналитика", href: "/panel/analytics" },
  { icon: IconSettings, label: "Настройки", href: "/panel/settings" },
]

interface PanelLayoutProps {
  children: React.ReactNode
}

export function PanelLayout({ children }: PanelLayoutProps) {
  const pathname = usePathname()

  return (
    <AppShell
      navbar={{ width: 250, breakpoint: "sm" }}
      padding="md"
    >
      <AppShell.Navbar p="md">
        <AppShell.Section>
          <Group>
            <Text size="xl" fw={700} c="blue">
              Админ панель
            </Text>
          </Group>
        </AppShell.Section>

        <AppShell.Section grow component={ScrollArea} mt="md">
          {navItems.map((item) => (
            <UnstyledButton
              key={item.href}
              component={Link}
              href={item.href}
              className={classes.navLink}
              data-active={pathname === item.href || undefined}
            >
              <Group>
                <item.icon style={{ width: rem(20), height: rem(20) }} stroke={1.5} />
                <Text size="sm">{item.label}</Text>
              </Group>
            </UnstyledButton>
          ))}
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  )
}