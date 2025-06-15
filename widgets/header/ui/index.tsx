"use client"

import { AppShell, Group, Button, Text, Menu, UnstyledButton, Avatar } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { IconUser, IconLogout, IconShoppingCart, IconHeart } from "@tabler/icons-react"
import Link from "next/link"
import { LoginModal } from "@/features/auth/ui/login-modal"
import { useAuth } from "@/features/auth/model/use-auth"
import { useAuthStore } from "@/features/auth/model/auth-store"

export function Header() {
  const [loginOpened, { open: openLogin, close: closeLogin }] = useDisclosure(false)
  const { user, isAuthenticated } = useAuth()
  const { logout } = useAuthStore()

  const handleLogout = async () => {
    await logout()
    window.location.href = "/"
  }

  return (
    <>
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Link href="/" style={{ textDecoration: "none" }}>
            <Text size="xl" fw={700} c="blue">
              Автозапчасти АСО
            </Text>
          </Link>

          <Group>
            <Button
              variant="subtle"
              leftSection={<IconShoppingCart size={20} />}
              component={Link}
              href="/cart"
            >
              Корзина
            </Button>

            {isAuthenticated ? (
              <>
                <Button
                  variant="subtle"
                  leftSection={<IconHeart size={20} />}
                  component={Link}
                  href="/profile/favorites"
                >
                  Избранное
                </Button>

                <Menu shadow="md" width={200}>
                  <Menu.Target>
                    <UnstyledButton>
                      <Group gap="xs">
                        <Avatar size="sm" color="blue">
                          <IconUser size={16} />
                        </Avatar>
                        <Text size="sm">{user?.phone}</Text>
                      </Group>
                    </UnstyledButton>
                  </Menu.Target>

                  <Menu.Dropdown>
                    <Menu.Item
                      leftSection={<IconUser size={16} />}
                      component={Link}
                      href="/profile"
                    >
                      Личный кабинет
                    </Menu.Item>
                    
                    {(user?.role === "ADMIN" || user?.role === "MANAGER") && (
                      <Menu.Item
                        component={Link}
                        href="/panel"
                      >
                        Админ панель
                      </Menu.Item>
                    )}
                    
                    <Menu.Divider />
                    
                    <Menu.Item
                      leftSection={<IconLogout size={16} />}
                      onClick={handleLogout}
                      color="red"
                    >
                      Выйти
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </>
            ) : (
              <Button
                leftSection={<IconUser size={20} />}
                onClick={openLogin}
              >
                Войти
              </Button>
            )}
          </Group>
        </Group>
      </AppShell.Header>

      <LoginModal opened={loginOpened} onClose={closeLogin} />
    </>
  )
}