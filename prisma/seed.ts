import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Создаем статусы чатов
  const chatStatuses = [
    { code: 'new', name: 'Новый', color: 'blue', sortOrder: 1 },
    { code: 'active', name: 'Активный', color: 'green', sortOrder: 2 },
    { code: 'waiting', name: 'Ожидание', color: 'yellow', sortOrder: 3 },
    { code: 'closed', name: 'Закрыт', color: 'gray', sortOrder: 4 },
  ]

  for (const status of chatStatuses) {
    await prisma.chatStatus.upsert({
      where: { code: status.code },
      update: {},
      create: status,
    })
  }

  // Создаем статусы заказов
  const orderStatuses = [
    { 
      code: 'new', 
      name: 'Новый', 
      color: 'blue', 
      isInitial: true,
      sortOrder: 1 
    },
    { 
      code: 'processing', 
      name: 'В обработке', 
      color: 'yellow', 
      sortOrder: 2 
    },
    { 
      code: 'paid', 
      name: 'Оплачен', 
      color: 'green', 
      sortOrder: 3 
    },
    { 
      code: 'shipped', 
      name: 'Отправлен', 
      color: 'blue', 
      sortOrder: 4 
    },
    { 
      code: 'delivered', 
      name: 'Доставлен', 
      color: 'green',
      isFinalSuccess: true, 
      canCancelOrder: false,
      sortOrder: 5 
    },
    { 
      code: 'cancelled', 
      name: 'Отменен', 
      color: 'red',
      isFinalFailure: true,
      canCancelOrder: false,
      sortOrder: 6 
    },
  ]

  for (const status of orderStatuses) {
    await prisma.orderStatus.upsert({
      where: { code: status.code },
      update: {},
      create: status,
    })
  }

  // Создаем методы доставки
  const deliveryMethods = [
    {
      code: 'pickup',
      name: 'Самовывоз',
      description: 'Самовывоз со склада',
      price: 0,
      sortOrder: 1,
    },
    {
      code: 'courier',
      name: 'Курьер',
      description: 'Доставка курьером по городу',
      price: 300,
      minAmount: 3000,
      sortOrder: 2,
    },
    {
      code: 'post',
      name: 'Почта России',
      description: 'Доставка Почтой России',
      price: 500,
      sortOrder: 3,
    },
  ]

  for (const method of deliveryMethods) {
    await prisma.deliveryMethod.upsert({
      where: { code: method.code },
      update: {},
      create: method,
    })
  }

  // Создаем методы оплаты
  const paymentMethods = [
    {
      code: 'cash',
      name: 'Наличными',
      description: 'Оплата наличными при получении',
      isOnline: false,
      sortOrder: 1,
    },
    {
      code: 'card',
      name: 'Банковской картой',
      description: 'Оплата картой онлайн',
      isOnline: true,
      commission: 2.5,
      sortOrder: 2,
    },
    {
      code: 'invoice',
      name: 'Счет для юр. лиц',
      description: 'Выставление счета для юридических лиц',
      isOnline: false,
      sortOrder: 3,
    },
  ]

  for (const method of paymentMethods) {
    await prisma.paymentMethod.upsert({
      where: { code: method.code },
      update: {},
      create: method,
    })
  }

  // Создаем тестового администратора
  const adminUser = await prisma.user.upsert({
    where: { phone: '+79999999999' },
    update: {},
    create: {
      phone: '+79999999999',
      email: 'admin@aso.ru',
      firstName: 'Админ',
      lastName: 'Админов',
      role: 'ADMIN',
      phoneVerified: true,
      emailVerified: true,
    },
  })

  // Создаем тестового менеджера
  const managerUser = await prisma.user.upsert({
    where: { phone: '+79998888888' },
    update: {},
    create: {
      phone: '+79998888888',
      email: 'manager@aso.ru',
      firstName: 'Менеджер',
      lastName: 'Менеджеров',
      role: 'MANAGER',
      phoneVerified: true,
      emailVerified: true,
    },
  })

  // Создаем тестовых покупателей
  const customers = [
    {
      phone: '+79997777777',
      email: 'customer1@example.com',
      firstName: 'Иван',
      lastName: 'Иванов',
    },
    {
      phone: '+79996666666',
      email: 'customer2@example.com',
      firstName: 'Петр',
      lastName: 'Петров',
    },
  ]

  for (const customer of customers) {
    await prisma.user.upsert({
      where: { phone: customer.phone },
      update: {},
      create: {
        ...customer,
        role: 'CUSTOMER',
        phoneVerified: true,
      },
    })
  }

  // Создаем группы клиентов
  const customerGroups = [
    {
      name: 'Обычные покупатели',
      discountPercent: 0,
    },
    {
      name: 'Постоянные клиенты',
      discountPercent: 5,
      minOrderAmount: 10000,
    },
    {
      name: 'VIP клиенты',
      discountPercent: 10,
      minOrderAmount: 50000,
    },
  ]

  for (const group of customerGroups) {
    const existingGroup = await prisma.customerGroup.findFirst({
      where: { name: group.name },
    })
    
    if (!existingGroup) {
      await prisma.customerGroup.create({
        data: group,
      })
    }
  }

  // Создаем бренды
  const brands = [
    { name: 'Bosch', slug: 'bosch', country: 'Германия' },
    { name: 'Mann-Filter', slug: 'mann-filter', country: 'Германия' },
    { name: 'Denso', slug: 'denso', country: 'Япония' },
    { name: 'NGK', slug: 'ngk', country: 'Япония' },
    { name: 'Sachs', slug: 'sachs', country: 'Германия' },
  ]

  for (const brand of brands) {
    await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: {},
      create: brand,
    })
  }

  // Создаем категории
  const categories = [
    { name: 'Фильтры', slug: 'filters', sortOrder: 1 },
    { name: 'Тормозная система', slug: 'brakes', sortOrder: 2 },
    { name: 'Двигатель', slug: 'engine', sortOrder: 3 },
    { name: 'Электрика', slug: 'electrics', sortOrder: 4 },
    { name: 'Подвеска', slug: 'suspension', sortOrder: 5 },
  ]

  const createdCategories = []
  for (const category of categories) {
    const created = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    })
    createdCategories.push(created)
  }

  // Создаем подкатегории для фильтров
  const filterSubcategories = [
    { name: 'Воздушные фильтры', slug: 'air-filters', parentId: createdCategories[0].id },
    { name: 'Масляные фильтры', slug: 'oil-filters', parentId: createdCategories[0].id },
    { name: 'Топливные фильтры', slug: 'fuel-filters', parentId: createdCategories[0].id },
    { name: 'Салонные фильтры', slug: 'cabin-filters', parentId: createdCategories[0].id },
  ]

  for (const subcategory of filterSubcategories) {
    await prisma.category.upsert({
      where: { slug: subcategory.slug },
      update: {},
      create: subcategory,
    })
  }

  // Создаем марки автомобилей
  const vehicleMakes = [
    { name: 'Toyota', slug: 'toyota', country: 'Япония' },
    { name: 'BMW', slug: 'bmw', country: 'Германия' },
    { name: 'Mercedes-Benz', slug: 'mercedes-benz', country: 'Германия' },
    { name: 'Volkswagen', slug: 'volkswagen', country: 'Германия' },
    { name: 'Nissan', slug: 'nissan', country: 'Япония' },
  ]

  for (const make of vehicleMakes) {
    await prisma.vehicleMake.upsert({
      where: { slug: make.slug },
      update: {},
      create: make,
    })
  }

  // Создаем системные настройки
  const settings = [
    { key: 'site_name', value: '"Автозапчасти АСО"', type: 'string', group: 'general' },
    { key: 'contact_phone', value: '"+7 (999) 123-45-67"', type: 'string', group: 'general' },
    { key: 'contact_email', value: '"info@aso.ru"', type: 'string', group: 'general' },
    { key: 'working_hours', value: '"Пн-Пт: 9:00-18:00, Сб: 10:00-16:00"', type: 'string', group: 'general' },
  ]

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    })
  }

  console.log('✅ Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })