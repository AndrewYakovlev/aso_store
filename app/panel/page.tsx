"use client"

import { Container, Title, SimpleGrid, Card, Text, Group, Stack } from "@mantine/core"
import { IconUsers, IconShoppingCart, IconPackage, IconCurrencyDollar } from "@tabler/icons-react"
import { useAuth } from "@/features/auth/model/use-auth"

export default function PanelDashboard() {
  const { user, isLoading } = useAuth()

  if (isLoading || !user) {
    return null
  }
  const stats = [
    {
      title: "Пользователи",
      value: "1,234",
      icon: IconUsers,
      color: "blue",
      description: "+12% за месяц",
    },
    {
      title: "Заказы",
      value: "456",
      icon: IconShoppingCart,
      color: "green",
      description: "+23% за месяц",
    },
    {
      title: "Товары",
      value: "12,345",
      icon: IconPackage,
      color: "violet",
      description: "1,234 активных",
    },
    {
      title: "Выручка",
      value: "₽1,234,567",
      icon: IconCurrencyDollar,
      color: "orange",
      description: "+18% за месяц",
    },
  ]

  return (
    <Container fluid>
      <Stack gap="xl">
        <Title order={1}>Панель управления</Title>

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
          {stats.map((stat) => (
            <Card key={stat.title} shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between">
                <div>
                  <Text c="dimmed" size="sm" tt="uppercase" fw={700}>
                    {stat.title}
                  </Text>
                  <Text fw={700} size="xl">
                    {stat.value}
                  </Text>
                  <Text c="dimmed" size="xs" mt={7}>
                    {stat.description}
                  </Text>
                </div>
                <stat.icon
                  size={32}
                  stroke={1.5}
                  color={`var(--mantine-color-${stat.color}-6)`}
                />
              </Group>
            </Card>
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  )
}