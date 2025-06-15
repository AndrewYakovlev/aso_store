"use client"

import { useState } from "react"
import {
  Container,
  Title,
  Paper,
  Group,
  TextInput,
  Button,
  Stack,
  ActionIcon,
  Badge,
  Text,
  Menu,
  Modal,
  Textarea,
  Switch,
  NumberInput,
  Select,
  Loader,
  Center,
} from "@mantine/core"
import {
  IconSearch,
  IconPlus,
  IconEdit,
  IconTrash,
  IconDots,
  IconChevronRight,
  IconChevronDown,
  IconGripVertical,
} from "@tabler/icons-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/shared/lib/api/client"
import { notifications } from "@mantine/notifications"
import { useForm } from "@mantine/form"

interface Category {
  id: string
  name: string
  slug: string
  description?: string | null
  parentId?: string | null
  parent?: { id: string; name: string } | null
  children?: Category[]
  sortOrder: number
  isActive: boolean
  _count: {
    children: number
    products: number
  }
}

interface CategoryFormValues {
  name: string
  description: string
  parentId: string | null
  sortOrder: number
  isActive: boolean
}

export default function CategoriesPage() {
  const [search, setSearch] = useState("")
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const queryClient = useQueryClient()

  const form = useForm<CategoryFormValues>({
    initialValues: {
      name: "",
      description: "",
      parentId: null,
      sortOrder: 0,
      isActive: true,
    },
    validate: {
      name: (value) => (!value ? "Название обязательно" : null),
    },
  })

  // Получаем дерево категорий
  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories", "tree"],
    queryFn: () =>
      apiClient
        .get<{ success: boolean; data: Category[] }>("/categories/tree")
        .then((res) => res.data),
  })

  // Получаем плоский список категорий для выбора родительской
  const { data: allCategories } = useQuery({
    queryKey: ["categories", "list"],
    queryFn: () =>
      apiClient
        .get<{ success: boolean; data: Category[] }>("/categories")
        .then((res) => res.data),
  })

  // Создание категории
  const createMutation = useMutation({
    mutationFn: (data: CategoryFormValues) =>
      apiClient.post("/categories", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      notifications.show({
        title: "Успешно",
        message: "Категория создана",
        color: "green",
      })
      handleCloseModal()
    },
    onError: () => {
      notifications.show({
        title: "Ошибка",
        message: "Не удалось создать категорию",
        color: "red",
      })
    },
  })

  // Обновление категории
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoryFormValues }) =>
      apiClient.patch(`/categories/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      notifications.show({
        title: "Успешно",
        message: "Категория обновлена",
        color: "green",
      })
      handleCloseModal()
    },
    onError: () => {
      notifications.show({
        title: "Ошибка",
        message: "Не удалось обновить категорию",
        color: "red",
      })
    },
  })

  // Удаление категории
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      notifications.show({
        title: "Успешно",
        message: "Категория удалена",
        color: "green",
      })
      setIsDeleteModalOpen(false)
      setSelectedCategory(null)
    },
    onError: (error: any) => {
      notifications.show({
        title: "Ошибка",
        message: error.response?.data?.error || "Не удалось удалить категорию",
        color: "red",
      })
    },
  })

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setSelectedCategory(category)
      form.setValues({
        name: category.name,
        description: category.description || "",
        parentId: category.parentId || null,
        sortOrder: category.sortOrder,
        isActive: category.isActive,
      })
    } else {
      setSelectedCategory(null)
      form.reset()
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedCategory(null)
    form.reset()
  }

  const handleSubmit = (values: CategoryFormValues) => {
    if (selectedCategory) {
      updateMutation.mutate({ id: selectedCategory.id, data: values })
    } else {
      createMutation.mutate(values)
    }
  }

  const toggleExpanded = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  const filterCategories = (categories: Category[], searchTerm: string): Category[] => {
    if (!searchTerm) return categories

    return categories.reduce((acc: Category[], category) => {
      const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase())
      const filteredChildren = category.children
        ? filterCategories(category.children, searchTerm)
        : []

      if (matchesSearch || filteredChildren.length > 0) {
        acc.push({
          ...category,
          children: filteredChildren,
        })
      }

      return acc
    }, [])
  }

  const renderCategory = (category: Category, level = 0) => {
    const isExpanded = expandedCategories.has(category.id)
    const hasChildren = category._count.children > 0

    return (
      <div key={category.id}>
        <Paper
          p="sm"
          withBorder
          style={{ marginLeft: level * 24 }}
          mb={4}
        >
          <Group justify="space-between">
            <Group>
              {hasChildren && (
                <ActionIcon
                  variant="subtle"
                  size="sm"
                  onClick={() => toggleExpanded(category.id)}
                >
                  {isExpanded ? (
                    <IconChevronDown size={16} />
                  ) : (
                    <IconChevronRight size={16} />
                  )}
                </ActionIcon>
              )}
              <IconGripVertical size={16} color="gray" />
              <div>
                <Text fw={500}>{category.name}</Text>
                <Text size="xs" c="dimmed">
                  {category.slug}
                </Text>
              </div>
              {!category.isActive && (
                <Badge color="gray" size="sm">
                  Неактивна
                </Badge>
              )}
              <Badge variant="light" size="sm">
                {category._count.products} товаров
              </Badge>
            </Group>
            <Menu position="bottom-end" shadow="md">
              <Menu.Target>
                <ActionIcon variant="subtle" size="sm">
                  <IconDots size={16} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<IconEdit size={14} />}
                  onClick={() => handleOpenModal(category)}
                >
                  Редактировать
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconPlus size={14} />}
                  onClick={() => {
                    form.setFieldValue("parentId", category.id)
                    handleOpenModal()
                  }}
                >
                  Добавить подкатегорию
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  color="red"
                  leftSection={<IconTrash size={14} />}
                  onClick={() => {
                    setSelectedCategory(category)
                    setIsDeleteModalOpen(true)
                  }}
                  disabled={category._count.children > 0 || category._count.products > 0}
                >
                  Удалить
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Paper>
        {isExpanded && category.children && category.children.length > 0 && (
          <div>
            {category.children.map((child) => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  if (isLoading) {
    return (
      <Center h={400}>
        <Loader size="xl" />
      </Center>
    )
  }

  const filteredCategories = categories
    ? filterCategories(categories, search)
    : []

  return (
    <Container fluid>
      <Group justify="space-between" mb="xl">
        <Title order={1}>Категории</Title>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => handleOpenModal()}
        >
          Добавить категорию
        </Button>
      </Group>

      <Paper p="md" withBorder mb="xl">
        <TextInput
          placeholder="Поиск категорий..."
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
        />
      </Paper>

      <Stack gap={0}>
        {filteredCategories.length > 0 ? (
          filteredCategories.map((category) => renderCategory(category))
        ) : (
          <Text ta="center" c="dimmed">
            Категории не найдены
          </Text>
        )}
      </Stack>

      {/* Модальное окно создания/редактирования */}
      <Modal
        opened={isModalOpen}
        onClose={handleCloseModal}
        title={selectedCategory ? "Редактировать категорию" : "Создать категорию"}
        size="md"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Название"
              placeholder="Например: Фильтры"
              required
              {...form.getInputProps("name")}
            />
            <Textarea
              label="Описание"
              placeholder="Описание категории"
              rows={3}
              {...form.getInputProps("description")}
            />
            <Select
              label="Родительская категория"
              placeholder="Выберите категорию"
              data={
                allCategories
                  ?.filter((cat) => cat.id !== selectedCategory?.id)
                  .map((cat) => ({
                    value: cat.id,
                    label: cat.name,
                  })) || []
              }
              clearable
              searchable
              {...form.getInputProps("parentId")}
            />
            <NumberInput
              label="Порядок сортировки"
              placeholder="0"
              min={0}
              {...form.getInputProps("sortOrder")}
            />
            <Switch
              label="Активна"
              {...form.getInputProps("isActive", { type: "checkbox" })}
            />
            <Group justify="flex-end">
              <Button variant="default" onClick={handleCloseModal}>
                Отмена
              </Button>
              <Button
                type="submit"
                loading={createMutation.isPending || updateMutation.isPending}
              >
                {selectedCategory ? "Сохранить" : "Создать"}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Модальное окно подтверждения удаления */}
      <Modal
        opened={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Удалить категорию"
        size="sm"
      >
        <Text mb="md">
          Вы уверены, что хотите удалить категорию "{selectedCategory?.name}"?
        </Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={() => setIsDeleteModalOpen(false)}>
            Отмена
          </Button>
          <Button
            color="red"
            onClick={() =>
              selectedCategory && deleteMutation.mutate(selectedCategory.id)
            }
            loading={deleteMutation.isPending}
          >
            Удалить
          </Button>
        </Group>
      </Modal>
    </Container>
  )
}