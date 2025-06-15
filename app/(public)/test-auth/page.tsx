"use client"

import { Container, Title, Text, Stack, Code, Paper } from "@mantine/core"
import { useAuth } from "@/features/auth/model/use-auth"

export default function TestAuthPage() {
  const { user, isAuthenticated, isLoading } = useAuth()

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        <Title order={1}>Тест авторизации</Title>
        
        <Paper p="md" withBorder>
          <Stack gap="sm">
            <Text fw={500}>Статус авторизации:</Text>
            <Code block>
              {JSON.stringify({ isAuthenticated, isLoading }, null, 2)}
            </Code>
          </Stack>
        </Paper>

        {user && (
          <Paper p="md" withBorder>
            <Stack gap="sm">
              <Text fw={500}>Данные пользователя:</Text>
              <Code block>
                {JSON.stringify(user, null, 2)}
              </Code>
            </Stack>
          </Paper>
        )}

        <Paper p="md" withBorder>
          <Stack gap="sm">
            <Text fw={500}>Тестовые пользователи:</Text>
            <Text size="sm">Администратор: +79999999999</Text>
            <Text size="sm">Менеджер: +79998888888</Text>
            <Text size="sm">Покупатель 1: +79997777777</Text>
            <Text size="sm">Покупатель 2: +79996666666</Text>
            <Text size="sm" c="dimmed">В режиме разработки OTP код выводится в консоль сервера</Text>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  )
}