"use client"

import { use } from "react"
import {
  Container,
  Title,
  Paper,
  Stack,
  Group,
  Text,
  Badge,
  Table,
  Tabs,
  Card,
  Loader,
  Center,
} from "@mantine/core"
import {
  IconShoppingCart,
  IconHeart,
  IconPackage,
  IconMessageCircle,
  IconLink,
} from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/shared/lib/api/client"
import { formatPrice } from "@/shared/lib/format"
import type { User } from "@/shared/types/user"

interface PageProps {
  params: Promise<{ id: string }>
}

export default function UserDetailPage({ params }: PageProps) {
  const { id } = use(params)

  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin", "users", id],
    queryFn: () =>
      apiClient.get<{ success: boolean; data: User }>(`/admin/users/${id}`).then((res) => res.data),
  })

  if (isLoading) {
    return (
      <Center h={400}>
        <Loader size="xl" />
      </Center>
    )
  }

  if (!user) {
    return (
      <Container>
        <Title>Пользователь не найден</Title>
        {error && (
          <Text color="red" mt="md">
            Ошибка:{" "}
            {error instanceof Error ? error.message : "Неизвестная ошибка"}
          </Text>
        )}
      </Container>
    )
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "red"
      case "MANAGER":
        return "blue"
      default:
        return "gray"
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Container fluid>
      <Title order={1} mb="xl">
        Информация о пользователе
      </Title>

      <Stack gap="xl">
        {/* Основная информация */}
        <Paper p="md" withBorder>
          <Stack gap="md">
            <Group justify="space-between">
              <Title order={3}>Основная информация</Title>
              <Badge
                color={getRoleBadgeColor(user.role)}
                variant="light"
                size="lg"
              >
                {user.role}
              </Badge>
            </Group>

            <Group gap="xl" wrap="wrap">
              <Stack gap="xs">
                <Text size="sm" c="dimmed">
                  ID
                </Text>
                <Text fw={500}>{user.id}</Text>
              </Stack>

              <Stack gap="xs">
                <Text size="sm" c="dimmed">
                  Имя
                </Text>
                <Text fw={500}>
                  {user.firstName} {user.lastName}
                </Text>
              </Stack>

              <Stack gap="xs">
                <Text size="sm" c="dimmed">
                  Телефон
                </Text>
                <Group gap="xs">
                  <Text fw={500}>{user.phone}</Text>
                  {user.phoneVerified && (
                    <Badge color="green" variant="light" size="sm">
                      Подтвержден
                    </Badge>
                  )}
                </Group>
              </Stack>

              <Stack gap="xs">
                <Text size="sm" c="dimmed">
                  Email
                </Text>
                <Group gap="xs">
                  <Text fw={500}>{user.email || "Не указан"}</Text>
                  {user.emailVerified && (
                    <Badge color="green" variant="light" size="sm">
                      Подтвержден
                    </Badge>
                  )}
                </Group>
              </Stack>

              <Stack gap="xs">
                <Text size="sm" c="dimmed">
                  Дата регистрации
                </Text>
                <Text fw={500}>{formatDate(user.createdAt)}</Text>
              </Stack>

              <Stack gap="xs">
                <Text size="sm" c="dimmed">
                  Последняя активность
                </Text>
                <Text fw={500}>{formatDate(user.lastActivityAt)}</Text>
              </Stack>
            </Group>

            {user.customerGroup && (
              <Group gap="xs">
                <Text size="sm" c="dimmed">
                  Группа покупателя:
                </Text>
                <Badge color="grape" variant="light">
                  {user.customerGroup.name} (-
                  {user.customerGroup.discountPercent}%)
                </Badge>
              </Group>
            )}
          </Stack>
        </Paper>

        {/* Статистика */}
        <Paper p="md" withBorder>
          <Title order={3} mb="md">
            Статистика
          </Title>
          <Group gap="xl">
            <Card p="md" withBorder>
              <Group gap="xs">
                <IconPackage size={20} />
                <Text size="sm" c="dimmed">
                  Заказов
                </Text>
              </Group>
              <Text size="xl" fw={700}>
                {user._count.orders}
              </Text>
            </Card>

            <Card p="md" withBorder>
              <Group gap="xs">
                <IconShoppingCart size={20} />
                <Text size="sm" c="dimmed">
                  Товаров в корзине
                </Text>
              </Group>
              <Text size="xl" fw={700}>
                {user.carts?.[0]?.items?.length || 0}
              </Text>
            </Card>

            <Card p="md" withBorder>
              <Group gap="xs">
                <IconHeart size={20} />
                <Text size="sm" c="dimmed">
                  В избранном
                </Text>
              </Group>
              <Text size="xl" fw={700}>
                {user._count.favorites}
              </Text>
            </Card>

            <Card p="md" withBorder>
              <Group gap="xs">
                <IconMessageCircle size={20} />
                <Text size="sm" c="dimmed">
                  Чатов
                </Text>
              </Group>
              <Text size="xl" fw={700}>
                {user._count.chats}
              </Text>
            </Card>
          </Group>
        </Paper>

        {/* Табы с дополнительной информацией */}
        <Tabs defaultValue="orders">
          <Tabs.List>
            <Tabs.Tab value="orders" leftSection={<IconPackage size={16} />}>
              Последние заказы
            </Tabs.Tab>
            <Tabs.Tab value="cart" leftSection={<IconShoppingCart size={16} />}>
              Корзина
            </Tabs.Tab>
            <Tabs.Tab value="favorites" leftSection={<IconHeart size={16} />}>
              Избранное
            </Tabs.Tab>
            <Tabs.Tab value="anonymous" leftSection={<IconLink size={16} />}>
              Анонимные сессии
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="orders" pt="md">
            {user.orders.length > 0 ? (
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>№ заказа</Table.Th>
                    <Table.Th>Дата</Table.Th>
                    <Table.Th>Статус</Table.Th>
                    <Table.Th>Сумма</Table.Th>
                    <Table.Th>Товаров</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {user.orders.map((order: any) => (
                    <Table.Tr key={order.id}>
                      <Table.Td>{order.orderNumber}</Table.Td>
                      <Table.Td>{formatDate(order.createdAt)}</Table.Td>
                      <Table.Td>
                        <Badge color={order.status.color} variant="light">
                          {order.status.name}
                        </Badge>
                      </Table.Td>
                      <Table.Td>{formatPrice(order.totalAmount)}</Table.Td>
                      <Table.Td>{order.items.length}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            ) : (
              <Text c="dimmed" ta="center">
                Заказов пока нет
              </Text>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="cart" pt="md">
            {user.carts?.[0]?.items?.length > 0 ? (
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Товар</Table.Th>
                    <Table.Th>Артикул</Table.Th>
                    <Table.Th>Количество</Table.Th>
                    <Table.Th>Цена</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {user.carts[0].items.map((item: any) => (
                    <Table.Tr key={item.id}>
                      <Table.Td>
                        {item.product?.name || "Товар из чата"}
                      </Table.Td>
                      <Table.Td>{item.product?.sku || "-"}</Table.Td>
                      <Table.Td>{item.quantity}</Table.Td>
                      <Table.Td>{formatPrice(item.price)}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            ) : (
              <Text c="dimmed" ta="center">
                Корзина пуста
              </Text>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="favorites" pt="md">
            {user.favorites?.length > 0 ? (
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Товар</Table.Th>
                    <Table.Th>Артикул</Table.Th>
                    <Table.Th>Цена</Table.Th>
                    <Table.Th>Дата добавления</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {user.favorites.map((item: any) => (
                    <Table.Tr key={item.id}>
                      <Table.Td>{item.product.name}</Table.Td>
                      <Table.Td>{item.product.sku}</Table.Td>
                      <Table.Td>{formatPrice(item.product.price)}</Table.Td>
                      <Table.Td>{formatDate(item.createdAt)}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            ) : (
              <Text c="dimmed" ta="center">
                Нет товаров в избранном
              </Text>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="anonymous" pt="md">
            {user.anonymousSessions?.length > 0 ? (
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>ID сессии</Table.Th>
                    <Table.Th>Токен</Table.Th>
                    <Table.Th>Создана</Table.Th>
                    <Table.Th>Последняя активность</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {user.anonymousSessions.map((session: any) => (
                    <Table.Tr key={session.id}>
                      <Table.Td>{session.sessionId.slice(0, 8)}...</Table.Td>
                      <Table.Td>{session.token.slice(0, 16)}...</Table.Td>
                      <Table.Td>{formatDate(session.createdAt)}</Table.Td>
                      <Table.Td>{formatDate(session.lastActivity)}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            ) : (
              <Text c="dimmed" ta="center">
                Нет связанных анонимных сессий
              </Text>
            )}
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  )
}
