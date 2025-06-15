"use client"

import { useState } from "react"
import {
  Container,
  Title,
  Paper,
  Group,
  TextInput,
  Button,
  Table,
  Badge,
  ActionIcon,
  Menu,
  Select,
  NumberInput,
  Image,
  Text,
  Pagination,
  Stack,
  Loader,
  Center,
  Switch,
} from "@mantine/core"
import {
  IconSearch,
  IconPlus,
  IconEdit,
  IconTrash,
  IconDots,
  IconEye,
  IconCopy,
} from "@tabler/icons-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/shared/lib/api/client"
import { notifications } from "@mantine/notifications"
import { useRouter } from "next/navigation"
import { formatPrice } from "@/shared/lib/format"
import { modals } from "@mantine/modals"

interface Product {
  id: string
  name: string
  slug: string
  sku: string
  price: string | number
  comparePrice?: string | number | null
  stock: number
  isActive: boolean
  isOriginal: boolean
  brand: {
    id: string
    name: string
  }
  images: Array<{
    id: string
    url: string
    alt?: string | null
  }>
  categories: Array<{
    category: {
      id: string
      name: string
    }
  }>
  _count: {
    favorites: number
    vehicleApplications: number
  }
}

interface ProductsResponse {
  success: boolean
  data: Product[]
  meta: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export default function ProductsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [brandId, setBrandId] = useState<string | null>(null)
  const [stockFilter, setStockFilter] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  
  const queryClient = useQueryClient()
  const router = useRouter()

  // Получаем список товаров
  const { data: productsData, isLoading } = useQuery({
    queryKey: ["products", { page, search, categoryId, brandId, stockFilter, activeFilter }],
    queryFn: () =>
      apiClient.get<ProductsResponse>("/products", {
        params: {
          page,
          limit: 20,
          search,
          ...(categoryId && { categoryId }),
          ...(brandId && { brandId }),
          ...(stockFilter && { inStock: stockFilter === "inStock" }),
          ...(activeFilter && { isActive: activeFilter === "active" }),
        },
      }).then((res) => res),
  })

  // Получаем категории для фильтра
  const { data: categories } = useQuery({
    queryKey: ["categories", "list"],
    queryFn: () =>
      apiClient
        .get<{ success: boolean; data: Array<{ id: string; name: string }> }>("/categories")
        .then((res) => res.data),
  })

  // Получаем бренды для фильтра
  const { data: brands } = useQuery({
    queryKey: ["brands", "list"],
    queryFn: () =>
      apiClient
        .get<{ success: boolean; data: Array<{ id: string; name: string }> }>("/brands")
        .then((res) => res.data),
  })

  // Удаление товара
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      notifications.show({
        title: "Успешно",
        message: "Товар удален",
        color: "green",
      })
    },
    onError: (error: any) => {
      notifications.show({
        title: "Ошибка",
        message: error.response?.data?.error || "Не удалось удалить товар",
        color: "red",
      })
    },
  })

  // Изменение статуса товара
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      apiClient.patch(`/products/${id}`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      notifications.show({
        title: "Успешно",
        message: "Статус товара изменен",
        color: "green",
      })
    },
    onError: () => {
      notifications.show({
        title: "Ошибка",
        message: "Не удалось изменить статус товара",
        color: "red",
      })
    },
  })

  const handleDelete = (product: Product) => {
    modals.openConfirmModal({
      title: "Удалить товар",
      children: (
        <Text size="sm">
          Вы уверены, что хотите удалить товар "{product.name}" (Артикул: {product.sku})?
        </Text>
      ),
      labels: { confirm: "Удалить", cancel: "Отмена" },
      confirmProps: { color: "red" },
      onConfirm: () => deleteMutation.mutate(product.id),
    })
  }

  const handleDuplicate = (product: Product) => {
    router.push(`/panel/products/new?duplicate=${product.id}`)
  }

  if (isLoading) {
    return (
      <Center h={400}>
        <Loader size="xl" />
      </Center>
    )
  }

  const products = productsData?.data || []
  const meta = productsData?.meta

  return (
    <Container fluid>
      <Group justify="space-between" mb="xl">
        <Title order={1}>Товары</Title>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => router.push("/panel/products/new")}
        >
          Добавить товар
        </Button>
      </Group>

      {/* Фильтры */}
      <Paper p="md" withBorder mb="xl">
        <Stack gap="md">
          <Group grow>
            <TextInput
              placeholder="Поиск по названию или артикулу..."
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(e) => {
                setSearch(e.currentTarget.value)
                setPage(1)
              }}
            />
          </Group>
          <Group grow>
            <Select
              placeholder="Все категории"
              data={
                categories?.map((cat) => ({
                  value: cat.id,
                  label: cat.name,
                })) || []
              }
              value={categoryId}
              onChange={(value) => {
                setCategoryId(value)
                setPage(1)
              }}
              clearable
              searchable
            />
            <Select
              placeholder="Все бренды"
              data={
                brands?.map((brand) => ({
                  value: brand.id,
                  label: brand.name,
                })) || []
              }
              value={brandId}
              onChange={(value) => {
                setBrandId(value)
                setPage(1)
              }}
              clearable
              searchable
            />
            <Select
              placeholder="Наличие"
              data={[
                { value: "inStock", label: "В наличии" },
                { value: "outOfStock", label: "Нет в наличии" },
              ]}
              value={stockFilter}
              onChange={(value) => {
                setStockFilter(value)
                setPage(1)
              }}
              clearable
            />
            <Select
              placeholder="Статус"
              data={[
                { value: "active", label: "Активные" },
                { value: "inactive", label: "Неактивные" },
              ]}
              value={activeFilter}
              onChange={(value) => {
                setActiveFilter(value)
                setPage(1)
              }}
              clearable
            />
          </Group>
        </Stack>
      </Paper>

      {/* Таблица товаров */}
      <Paper withBorder>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th w={60}>Фото</Table.Th>
              <Table.Th>Название</Table.Th>
              <Table.Th>Артикул</Table.Th>
              <Table.Th>Бренд</Table.Th>
              <Table.Th>Категории</Table.Th>
              <Table.Th>Цена</Table.Th>
              <Table.Th>Наличие</Table.Th>
              <Table.Th>Статус</Table.Th>
              <Table.Th w={60}>Действия</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {products.length > 0 ? (
              products.map((product) => (
                <Table.Tr key={product.id}>
                  <Table.Td>
                    {product.images.length > 0 ? (
                      <Image
                        src={product.images[0].url}
                        alt={product.images[0].alt || product.name}
                        width={40}
                        height={40}
                        radius="sm"
                      />
                    ) : (
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          backgroundColor: "#f0f0f0",
                          borderRadius: 4,
                        }}
                      />
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Text lineClamp={2} size="sm">
                      {product.name}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge variant="light">{product.sku}</Badge>
                  </Table.Td>
                  <Table.Td>{product.brand.name}</Table.Td>
                  <Table.Td>
                    <Group gap={4}>
                      {product.categories.slice(0, 2).map((cat, index) => (
                        <Badge key={index} size="sm" variant="light">
                          {cat.category.name}
                        </Badge>
                      ))}
                      {product.categories.length > 2 && (
                        <Badge size="sm" variant="light" color="gray">
                          +{product.categories.length - 2}
                        </Badge>
                      )}
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Stack gap={0}>
                      <Text size="sm" fw={500}>
                        {formatPrice(product.price)}
                      </Text>
                      {product.comparePrice && (
                        <Text size="xs" c="dimmed" td="line-through">
                          {formatPrice(product.comparePrice)}
                        </Text>
                      )}
                    </Stack>
                  </Table.Td>
                  <Table.Td>
                    <Badge
                      color={product.stock > 0 ? "green" : "red"}
                      variant="light"
                    >
                      {product.stock > 0 ? `${product.stock} шт` : "Нет"}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Switch
                      checked={product.isActive}
                      onChange={(event) =>
                        toggleStatusMutation.mutate({
                          id: product.id,
                          isActive: event.currentTarget.checked,
                        })
                      }
                      size="sm"
                    />
                  </Table.Td>
                  <Table.Td>
                    <Menu position="bottom-end" shadow="md" width={200}>
                      <Menu.Target>
                        <ActionIcon variant="subtle" size="sm">
                          <IconDots size={16} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item
                          leftSection={<IconEye size={14} />}
                          onClick={() =>
                            window.open(`/products/${product.slug}`, "_blank")
                          }
                        >
                          Посмотреть на сайте
                        </Menu.Item>
                        <Menu.Item
                          leftSection={<IconEdit size={14} />}
                          onClick={() =>
                            router.push(`/panel/products/${product.id}`)
                          }
                        >
                          Редактировать
                        </Menu.Item>
                        <Menu.Item
                          leftSection={<IconCopy size={14} />}
                          onClick={() => handleDuplicate(product)}
                        >
                          Дублировать
                        </Menu.Item>
                        <Menu.Divider />
                        <Menu.Item
                          color="red"
                          leftSection={<IconTrash size={14} />}
                          onClick={() => handleDelete(product)}
                        >
                          Удалить
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Table.Td>
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={9}>
                  <Text ta="center" c="dimmed">
                    Товары не найдены
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Paper>

      {/* Пагинация */}
      {meta && meta.totalPages > 1 && (
        <Group justify="center" mt="xl">
          <Pagination
            value={page}
            onChange={setPage}
            total={meta.totalPages}
          />
        </Group>
      )}
    </Container>
  )
}