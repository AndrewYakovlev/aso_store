"use client"

import { Container, Title, Card, Stack, Text, Group, Button, SimpleGrid } from "@mantine/core"
import { IconUser, IconShoppingCart, IconHeart, IconMapPin } from "@tabler/icons-react"
import Link from "next/link"
import { useAuth } from "@/features/auth/model/use-auth"

export default function ProfilePage() {
  const { user, isLoading } = useAuth()

  if (isLoading || !user) {
    return null
  }

  const menuItems = [
    {
      icon: IconShoppingCart,
      title: "Мои заказы",
      description: "История и статус заказов",
      href: "/profile/orders",
    },
    {
      icon: IconHeart,
      title: "Избранное",
      description: "Сохраненные товары",
      href: "/profile/favorites",
    },
    {
      icon: IconMapPin,
      title: "Адреса доставки",
      description: "Управление адресами",
      href: "/profile/addresses",
    },
    {
      icon: IconUser,
      title: "Личные данные",
      description: "Редактировать профиль",
      href: "/profile/settings",
    },
  ]

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <div>
          <Title order={1}>Личный кабинет</Title>
          <Text c="dimmed" mt="xs">
            {user.phone}
          </Text>
        </div>

        <SimpleGrid cols={{ base: 1, sm: 2, md: 2 }} spacing="lg">
          {menuItems.map((item) => (
            <Card
              key={item.title}
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
              component={Link}
              href={item.href}
              style={{ textDecoration: "none" }}
            >
              <Group wrap="nowrap">
                <item.icon size={32} stroke={1.5} color="var(--mantine-color-blue-6)" />
                <div>
                  <Text fw={500}>{item.title}</Text>
                  <Text size="sm" c="dimmed">
                    {item.description}
                  </Text>
                </div>
              </Group>
            </Card>
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  )
}