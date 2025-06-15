"use client"

import { Container, Title, Text, Group, Stack, Card, SimpleGrid } from "@mantine/core"
import { IconShoppingCart, IconSearch, IconTruck, IconHeadset } from "@tabler/icons-react"

export default function Home() {
  const features = [
    {
      icon: IconSearch,
      title: "Удобный поиск",
      description: "Поиск по каталогу, артикулу, марке автомобиля",
    },
    {
      icon: IconShoppingCart,
      title: "Большой ассортимент",
      description: "Более 100 000 наименований автозапчастей",
    },
    {
      icon: IconTruck,
      title: "Быстрая доставка",
      description: "Доставка по городу в день заказа",
    },
    {
      icon: IconHeadset,
      title: "Поддержка 24/7",
      description: "Консультация специалистов онлайн",
    },
  ]

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Stack gap="md" align="center" ta="center">
          <Title order={1} size="h1">
            Автозапчасти для всех марок автомобилей
          </Title>
          <Text size="lg" c="dimmed" maw={600}>
            Оригинальные запчасти и качественные аналоги с гарантией. 
            Подбор по VIN-коду, быстрая доставка по всей России.
          </Text>
        </Stack>

        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg" mt="xl">
          {features.map((feature) => (
            <Card key={feature.title} padding="lg" radius="md" withBorder>
              <Stack align="center" ta="center">
                <feature.icon size={48} stroke={1.5} color="var(--mantine-color-blue-6)" />
                <Title order={4}>{feature.title}</Title>
                <Text size="sm" c="dimmed">
                  {feature.description}
                </Text>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  )
}