"use client"

import { useState } from "react"
import { Container, Title, Table, Badge, Group, TextInput, Select, Button, ActionIcon, Menu } from "@mantine/core"
import { IconSearch, IconEdit, IconEye, IconDots, IconUserCog, IconShieldCheck, IconUser } from "@tabler/icons-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/shared/lib/api/client"
import { notifications } from "@mantine/notifications"
import { useRouter } from "next/navigation"

interface UserListItem {
  id: string
  phone: string
  email?: string | null
  firstName?: string | null
  lastName?: string | null
  role: 'CUSTOMER' | 'MANAGER' | 'ADMIN'
  phoneVerified: boolean
  createdAt: string
  lastActivityAt: string
}

export function UserManagementWidget() {
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const router = useRouter()

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin", "users", { search, role: roleFilter }],
    queryFn: () =>
      apiClient.get<{ success: boolean; data: UserListItem[] }>("/admin/users", {
        params: { 
          search, 
          ...(roleFilter && { role: roleFilter })
        },
      }).then(res => res.data),
  })

  const changeRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      apiClient.patch(`/admin/users/${userId}/role`, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
      notifications.show({
        title: "Успешно",
        message: "Роль пользователя изменена",
        color: "green",
      })
    },
    onError: () => {
      notifications.show({
        title: "Ошибка",
        message: "Не удалось изменить роль пользователя",
        color: "red",
      })
    },
  })

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN": return "red"
      case "MANAGER": return "blue"
      default: return "gray"
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("ru-RU")
  }

  return (
    <Container fluid>
      <Title order={1} mb="xl">Управление пользователями</Title>

      <Group mb="md">
        <TextInput
          placeholder="Поиск по телефону или email"
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          style={{ flex: 1 }}
        />
        <Select
          placeholder="Все роли"
          data={[
            { value: "CUSTOMER", label: "Покупатель" },
            { value: "MANAGER", label: "Менеджер" },
            { value: "ADMIN", label: "Администратор" },
          ]}
          value={roleFilter}
          onChange={setRoleFilter}
          clearable
        />
      </Group>

      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>ID</Table.Th>
            <Table.Th>Телефон</Table.Th>
            <Table.Th>Email</Table.Th>
            <Table.Th>Имя</Table.Th>
            <Table.Th>Роль</Table.Th>
            <Table.Th>Подтвержден</Table.Th>
            <Table.Th>Дата регистрации</Table.Th>
            <Table.Th>Последняя активность</Table.Th>
            <Table.Th>Действия</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {users?.map((user) => (
            <Table.Tr key={user.id}>
              <Table.Td>{user.id.slice(0, 8)}...</Table.Td>
              <Table.Td>{user.phone}</Table.Td>
              <Table.Td>{user.email || "-"}</Table.Td>
              <Table.Td>{user.firstName} {user.lastName}</Table.Td>
              <Table.Td>
                <Badge color={getRoleBadgeColor(user.role)} variant="light">
                  {user.role}
                </Badge>
              </Table.Td>
              <Table.Td>
                <Badge color={user.phoneVerified ? "green" : "gray"} variant="light">
                  {user.phoneVerified ? "Да" : "Нет"}
                </Badge>
              </Table.Td>
              <Table.Td>{formatDate(user.createdAt)}</Table.Td>
              <Table.Td>{formatDate(user.lastActivityAt)}</Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <ActionIcon 
                    variant="subtle" 
                    size="sm"
                    onClick={() => router.push(`/panel/users/${user.id}`)}
                  >
                    <IconEye size={16} />
                  </ActionIcon>
                  <Menu position="bottom-end" shadow="md" width={200}>
                    <Menu.Target>
                      <ActionIcon variant="subtle" size="sm">
                        <IconDots size={16} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Label>Изменить роль</Menu.Label>
                      <Menu.Item
                        leftSection={<IconUser size={14} />}
                        onClick={() => changeRoleMutation.mutate({ userId: user.id, role: "CUSTOMER" })}
                        disabled={user.role === "CUSTOMER"}
                      >
                        Покупатель
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<IconUserCog size={14} />}
                        onClick={() => changeRoleMutation.mutate({ userId: user.id, role: "MANAGER" })}
                        disabled={user.role === "MANAGER"}
                      >
                        Менеджер
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<IconShieldCheck size={14} />}
                        onClick={() => changeRoleMutation.mutate({ userId: user.id, role: "ADMIN" })}
                        disabled={user.role === "ADMIN"}
                      >
                        Администратор
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Container>
  )
}