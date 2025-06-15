"use client"

import { useState, useEffect } from "react"
import {
  Container,
  Title,
  Paper,
  Stack,
  Group,
  TextInput,
  Textarea,
  NumberInput,
  Select,
  MultiSelect,
  Switch,
  Button,
  Grid,
  Text,
  Image,
  ActionIcon,
  LoadingOverlay,
  Badge,
} from "@mantine/core"
import {
  IconPlus,
  IconTrash,
  IconUpload,
  IconGripVertical,
  IconArrowLeft,
} from "@tabler/icons-react"
import { useForm } from "@mantine/form"
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone"
import { useQuery, useMutation } from "@tanstack/react-query"
import { apiClient } from "@/shared/lib/api/client"
import { notifications } from "@mantine/notifications"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"

interface ProductFormProps {
  productId?: string
  duplicateId?: string | null
  onSuccess: () => void
  onCancel: () => void
}

interface ProductImage {
  id?: string
  url: string
  alt?: string
  sortOrder: number
}

interface ProductFormValues {
  name: string
  sku: string
  description: string
  shortDescription: string
  price: number
  comparePrice: number | null
  stock: number
  deliveryDays: number | null
  weight: number | null
  brandId: string
  isOriginal: boolean
  isActive: boolean
  categoryIds: string[]
  images: ProductImage[]
  minOrderQuantity: number
  metaTitle: string
  metaDescription: string
  metaKeywords: string
}

export function ProductForm({
  productId,
  duplicateId,
  onSuccess,
  onCancel,
}: ProductFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)

  const form = useForm<ProductFormValues>({
    initialValues: {
      name: "",
      sku: "",
      description: "",
      shortDescription: "",
      price: 0,
      comparePrice: null,
      stock: 0,
      deliveryDays: null,
      weight: null,
      brandId: "",
      isOriginal: true,
      isActive: true,
      categoryIds: [],
      images: [],
      minOrderQuantity: 1,
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
    },
    validate: {
      name: (value) => (!value ? "Название обязательно" : null),
      sku: (value) => (!value ? "Артикул обязателен" : null),
      price: (value) => (value <= 0 ? "Цена должна быть больше 0" : null),
      brandId: (value) => (!value ? "Выберите бренд" : null),
      categoryIds: (value) =>
        value.length === 0 ? "Выберите хотя бы одну категорию" : null,
    },
  })

  // Загружаем данные товара для редактирования
  const { data: product } = useQuery({
    queryKey: ["product", productId],
    queryFn: () =>
      apiClient
        .get<{ success: boolean; data: any }>(`/products/${productId}`)
        .then((res) => res.data),
    enabled: !!productId && productId !== "new",
  })

  // Загружаем данные товара для дублирования
  const { data: duplicateProduct } = useQuery({
    queryKey: ["product", duplicateId],
    queryFn: () =>
      apiClient
        .get<{ success: boolean; data: any }>(`/products/${duplicateId}`)
        .then((res) => res.data),
    enabled: !!duplicateId,
  })

  // Загружаем категории
  const { data: categories } = useQuery({
    queryKey: ["categories", "list"],
    queryFn: () =>
      apiClient
        .get<{ success: boolean; data: Array<{ id: string; name: string }> }>(
          "/categories"
        )
        .then((res) => res.data),
  })

  // Загружаем бренды
  const { data: brands } = useQuery({
    queryKey: ["brands", "list"],
    queryFn: () =>
      apiClient
        .get<{ success: boolean; data: Array<{ id: string; name: string }> }>(
          "/brands"
        )
        .then((res) => res.data),
  })

  // Создание товара
  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.post("/products", data),
    onSuccess: () => {
      notifications.show({
        title: "Успешно",
        message: "Товар создан",
        color: "green",
      })
      onSuccess()
    },
    onError: (error: any) => {
      notifications.show({
        title: "Ошибка",
        message: error.response?.data?.error || "Не удалось создать товар",
        color: "red",
      })
    },
  })

  // Обновление товара
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiClient.patch(`/products/${id}`, data),
    onSuccess: () => {
      notifications.show({
        title: "Успешно",
        message: "Товар обновлен",
        color: "green",
      })
      onSuccess()
    },
    onError: (error: any) => {
      notifications.show({
        title: "Ошибка",
        message: error.response?.data?.error || "Не удалось обновить товар",
        color: "red",
      })
    },
  })

  // Заполняем форму данными товара
  useEffect(() => {
    if (product) {
      form.setValues({
        name: product.name,
        sku: product.sku,
        description: product.description || "",
        shortDescription: product.shortDescription || "",
        price: parseFloat(product.price),
        comparePrice: product.comparePrice ? parseFloat(product.comparePrice) : null,
        stock: product.stock,
        deliveryDays: product.deliveryDays,
        weight: product.weight ? parseFloat(product.weight) : null,
        brandId: product.brand.id,
        isOriginal: product.isOriginal,
        isActive: product.isActive,
        categoryIds: product.categories.map((c: any) => c.category.id),
        images: product.images.map((img: any) => ({
          id: img.id,
          url: img.url,
          alt: img.alt || "",
          sortOrder: img.sortOrder,
        })),
        minOrderQuantity: product.minOrderQuantity || 1,
        metaTitle: product.metaTitle || "",
        metaDescription: product.metaDescription || "",
        metaKeywords: product.metaKeywords || "",
      })
    }
  }, [product])

  // Заполняем форму данными для дублирования
  useEffect(() => {
    if (duplicateProduct) {
      form.setValues({
        name: duplicateProduct.name + " (копия)",
        sku: duplicateProduct.sku + "-copy",
        description: duplicateProduct.description || "",
        shortDescription: duplicateProduct.shortDescription || "",
        price: parseFloat(duplicateProduct.price),
        comparePrice: duplicateProduct.comparePrice
          ? parseFloat(duplicateProduct.comparePrice)
          : null,
        stock: 0, // Сбрасываем наличие для копии
        deliveryDays: duplicateProduct.deliveryDays,
        weight: duplicateProduct.weight ? parseFloat(duplicateProduct.weight) : null,
        brandId: duplicateProduct.brand.id,
        isOriginal: duplicateProduct.isOriginal,
        isActive: false, // Делаем копию неактивной
        categoryIds: duplicateProduct.categories.map((c: any) => c.category.id),
        images: duplicateProduct.images.map((img: any) => ({
          url: img.url,
          alt: img.alt || "",
          sortOrder: img.sortOrder,
        })),
        minOrderQuantity: duplicateProduct.minOrderQuantity || 1,
        metaTitle: "",
        metaDescription: "",
        metaKeywords: "",
      })
    }
  }, [duplicateProduct])

  const handleImageUpload = async (files: File[]) => {
    setUploadingImages(true)
    try {
      // Здесь должна быть логика загрузки изображений на сервер
      // Пока используем заглушку с data URL
      const newImages = await Promise.all(
        files.map(async (file, index) => {
          const url = await new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result as string)
            reader.readAsDataURL(file)
          })
          return {
            url,
            alt: "",
            sortOrder: form.values.images.length + index,
          }
        })
      )
      form.setFieldValue("images", [...form.values.images, ...newImages])
    } catch (error) {
      notifications.show({
        title: "Ошибка",
        message: "Не удалось загрузить изображения",
        color: "red",
      })
    } finally {
      setUploadingImages(false)
    }
  }

  const handleImageReorder = (result: any) => {
    if (!result.destination) return

    const items = Array.from(form.values.images)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Обновляем sortOrder
    const reorderedImages = items.map((img, index) => ({
      ...img,
      sortOrder: index,
    }))

    form.setFieldValue("images", reorderedImages)
  }

  const handleRemoveImage = (index: number) => {
    const images = form.values.images.filter((_, i) => i !== index)
    form.setFieldValue("images", images)
  }

  const handleSubmit = (values: ProductFormValues) => {
    setIsLoading(true)
    const data = {
      ...values,
      price: values.price,
      comparePrice: values.comparePrice,
      weight: values.weight,
      dimensions: null, // TODO: добавить поля для размеров
    }

    if (productId && productId !== "new") {
      updateMutation.mutate({ id: productId, data })
    } else {
      createMutation.mutate(data)
    }
  }

  return (
    <Container fluid>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <LoadingOverlay visible={isLoading} />
        
        <Group justify="space-between" mb="xl">
          <Group>
            <ActionIcon variant="subtle" onClick={onCancel}>
              <IconArrowLeft size={20} />
            </ActionIcon>
            <Title order={1}>
              {productId && productId !== "new"
                ? "Редактировать товар"
                : "Новый товар"}
            </Title>
          </Group>
          <Group>
            <Button variant="default" onClick={onCancel}>
              Отмена
            </Button>
            <Button type="submit" loading={isLoading}>
              {productId && productId !== "new" ? "Сохранить" : "Создать"}
            </Button>
          </Group>
        </Group>

        <Grid>
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Stack>
              {/* Основная информация */}
              <Paper p="md" withBorder>
                <Title order={3} mb="md">
                  Основная информация
                </Title>
                <Stack>
                  <TextInput
                    label="Название товара"
                    placeholder="Например: Масляный фильтр Mann W 712/52"
                    required
                    {...form.getInputProps("name")}
                  />
                  <Grid>
                    <Grid.Col span={6}>
                      <TextInput
                        label="Артикул"
                        placeholder="W71252"
                        required
                        {...form.getInputProps("sku")}
                      />
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <Select
                        label="Бренд"
                        placeholder="Выберите бренд"
                        required
                        data={
                          brands?.map((brand) => ({
                            value: brand.id,
                            label: brand.name,
                          })) || []
                        }
                        searchable
                        {...form.getInputProps("brandId")}
                      />
                    </Grid.Col>
                  </Grid>
                  <Textarea
                    label="Краткое описание"
                    placeholder="Краткое описание товара"
                    rows={2}
                    {...form.getInputProps("shortDescription")}
                  />
                  <Textarea
                    label="Полное описание"
                    placeholder="Подробное описание товара"
                    rows={5}
                    {...form.getInputProps("description")}
                  />
                </Stack>
              </Paper>

              {/* Изображения */}
              <Paper p="md" withBorder>
                <Title order={3} mb="md">
                  Изображения
                </Title>
                <Stack>
                  <Dropzone
                    onDrop={handleImageUpload}
                    maxSize={5 * 1024 ** 2}
                    accept={IMAGE_MIME_TYPE}
                    loading={uploadingImages}
                  >
                    <Group
                      justify="center"
                      gap="xl"
                      mih={120}
                      style={{ pointerEvents: "none" }}
                    >
                      <Dropzone.Accept>
                        <IconUpload size={50} stroke={1.5} />
                      </Dropzone.Accept>
                      <Dropzone.Reject>
                        <IconX size={50} stroke={1.5} />
                      </Dropzone.Reject>
                      <Dropzone.Idle>
                        <IconUpload size={50} stroke={1.5} />
                      </Dropzone.Idle>
                      <div>
                        <Text size="xl" inline>
                          Перетащите изображения сюда
                        </Text>
                        <Text size="sm" c="dimmed" inline mt={7}>
                          Или нажмите для выбора файлов
                        </Text>
                      </div>
                    </Group>
                  </Dropzone>

                  {form.values.images.length > 0 && (
                    <DragDropContext onDragEnd={handleImageReorder}>
                      <Droppable droppableId="images">
                        {(provided) => (
                          <div {...provided.droppableProps} ref={provided.innerRef}>
                            {form.values.images.map((image, index) => (
                              <Draggable
                                key={index}
                                draggableId={`image-${index}`}
                                index={index}
                              >
                                {(provided) => (
                                  <Paper
                                    p="xs"
                                    withBorder
                                    mb="xs"
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                  >
                                    <Group justify="space-between">
                                      <Group>
                                        <div {...provided.dragHandleProps}>
                                          <IconGripVertical size={16} />
                                        </div>
                                        <Image
                                          src={image.url}
                                          alt={image.alt || ""}
                                          width={60}
                                          height={60}
                                          radius="sm"
                                        />
                                        <TextInput
                                          placeholder="Alt текст"
                                          value={image.alt || ""}
                                          onChange={(e) => {
                                            const newImages = [...form.values.images]
                                            newImages[index].alt = e.currentTarget.value
                                            form.setFieldValue("images", newImages)
                                          }}
                                          style={{ flex: 1 }}
                                        />
                                      </Group>
                                      <ActionIcon
                                        color="red"
                                        variant="subtle"
                                        onClick={() => handleRemoveImage(index)}
                                      >
                                        <IconTrash size={16} />
                                      </ActionIcon>
                                    </Group>
                                  </Paper>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  )}
                </Stack>
              </Paper>

              {/* SEO */}
              <Paper p="md" withBorder>
                <Title order={3} mb="md">
                  SEO настройки
                </Title>
                <Stack>
                  <TextInput
                    label="Meta заголовок"
                    placeholder="Заголовок для поисковых систем"
                    {...form.getInputProps("metaTitle")}
                  />
                  <Textarea
                    label="Meta описание"
                    placeholder="Описание для поисковых систем"
                    rows={3}
                    {...form.getInputProps("metaDescription")}
                  />
                  <TextInput
                    label="Ключевые слова"
                    placeholder="Через запятую"
                    {...form.getInputProps("metaKeywords")}
                  />
                </Stack>
              </Paper>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack>
              {/* Статус и настройки */}
              <Paper p="md" withBorder>
                <Title order={3} mb="md">
                  Статус
                </Title>
                <Stack>
                  <Switch
                    label="Активен"
                    {...form.getInputProps("isActive", { type: "checkbox" })}
                  />
                  <Switch
                    label="Оригинальная запчасть"
                    {...form.getInputProps("isOriginal", { type: "checkbox" })}
                  />
                </Stack>
              </Paper>

              {/* Цены и наличие */}
              <Paper p="md" withBorder>
                <Title order={3} mb="md">
                  Цены и наличие
                </Title>
                <Stack>
                  <NumberInput
                    label="Цена"
                    placeholder="0"
                    required
                    min={0}
                    decimalScale={2}
                    fixedDecimalScale
                    {...form.getInputProps("price")}
                  />
                  <NumberInput
                    label="Цена до скидки"
                    placeholder="0"
                    min={0}
                    decimalScale={2}
                    fixedDecimalScale
                    {...form.getInputProps("comparePrice")}
                  />
                  <NumberInput
                    label="Количество на складе"
                    placeholder="0"
                    min={0}
                    {...form.getInputProps("stock")}
                  />
                  <NumberInput
                    label="Минимальный заказ"
                    placeholder="1"
                    min={1}
                    {...form.getInputProps("minOrderQuantity")}
                  />
                  <NumberInput
                    label="Срок доставки (дней)"
                    placeholder="1"
                    min={0}
                    {...form.getInputProps("deliveryDays")}
                  />
                </Stack>
              </Paper>

              {/* Категории */}
              <Paper p="md" withBorder>
                <Title order={3} mb="md">
                  Категории
                </Title>
                <MultiSelect
                  placeholder="Выберите категории"
                  required
                  data={
                    categories?.map((cat) => ({
                      value: cat.id,
                      label: cat.name,
                    })) || []
                  }
                  searchable
                  {...form.getInputProps("categoryIds")}
                />
              </Paper>

              {/* Физические параметры */}
              <Paper p="md" withBorder>
                <Title order={3} mb="md">
                  Физические параметры
                </Title>
                <Stack>
                  <NumberInput
                    label="Вес (кг)"
                    placeholder="0"
                    min={0}
                    decimalScale={3}
                    fixedDecimalScale
                    {...form.getInputProps("weight")}
                  />
                </Stack>
              </Paper>
            </Stack>
          </Grid.Col>
        </Grid>
      </form>
    </Container>
  )
}

// Временная заглушка для IconX
const IconX = IconTrash