# План разработки интернет-магазина "Автозапчасти АСО"

## Общая информация

**Проект**: Интернет-магазин автозапчастей с автомобильным каталогом  
**Технологический стек**: Next.js 15.3.3, React 19, TypeScript, Prisma, PostgreSQL  
**Архитектура**: Feature-Sliced Design (FSD)  
**Сроки MVP**: 90-100 дней (13 этапов)

## Статус выполнения

| Этап | Название | Длительность | Статус | Прогресс |
|------|----------|--------------|--------|----------|
| 0 | Базовая инфраструктура | 5 дней | ✅ Завершен | 100% |
| 1 | Авторизация и управление пользователями | 7 дней | ✅ Завершен | 100% |
| 2 | Каталог товаров - базовый функционал | 10 дней | ⏳ Ожидает | 0% |
| 3 | Корзина и избранное | 7 дней | ⏳ Ожидает | 0% |
| 4 | Оформление и управление заказами | 10 дней | ⏳ Ожидает | 0% |
| 5 | Характеристики товаров и расширенная фильтрация | 7 дней | ⏳ Ожидает | 0% |
| 6 | Автомобильный каталог и применимость | 10 дней | ⏳ Ожидает | 0% |
| 7 | Поиск и SEO оптимизация | 5 дней | ⏳ Ожидает | 0% |
| 8 | Система скидок и промокодов | 5 дней | ⏳ Ожидает | 0% |
| 9 | Чат поддержки | 10 дней | ⏳ Ожидает | 0% |
| 10 | Импорт/экспорт и интеграции | 7 дней | ⏳ Ожидает | 0% |
| 11 | Аналитика и отчеты | 5 дней | ⏳ Ожидает | 0% |
| 12 | PWA и мобильная оптимизация | 5 дней | ⏳ Ожидает | 0% |
| 13 | Безопасность и финальная оптимизация | 5 дней | ⏳ Ожидает | 0% |

---

## Детальный план по этапам

### Этап 0: Базовая инфраструктура (5 дней)

#### 0.1 Инициализация проекта и FSD структура
**Статус**: ✅ Выполнено
- [x] Создан базовый проект Next.js 15.3.3
- [x] Установлены React 19, TypeScript 5
- [x] Настроен Tailwind CSS 4
- [x] Создать FSD структуру папок:
  ```
  ├── app/          # Next.js App Router (только роутинг)
  ├── widgets/      # Самостоятельные блоки UI
  ├── features/     # Пользовательские сценарии
  ├── entities/     # Бизнес-сущности
  ├── shared/       # Переиспользуемый код
  │   ├── ui/       # UI компоненты и обертки Mantine
  │   ├── lib/      # Библиотеки и утилиты
  │   ├── types/    # TypeScript типы
  │   └── constants/ # Константы
  ```

#### 0.2 Установка и настройка Mantine UI
**Статус**: ✅ Выполнено
- [x] Установить Mantine пакеты:
  - [x] @mantine/core ^8.1.0
  - [x] @mantine/hooks ^8.1.0
  - [x] @mantine/form ^8.1.0
  - [x] @mantine/dates ^8.1.0
  - [x] @mantine/notifications ^8.1.0
  - [x] @mantine/modals ^8.1.0
  - [x] @mantine/spotlight ^8.1.0
  - [x] @mantine/dropzone ^8.1.0
  - [x] @mantine/charts ^8.1.0
  - [x] @mantine/carousel ^8.1.0
  - [x] @mantine/code-highlight ^8.1.0
  - [x] postcss-preset-mantine ^1.17.0
  - [x] postcss-simple-vars ^7.0.1
- [x] Настроить PostCSS для Mantine
- [x] Создать кастомную тему в shared/ui/mantine/theme.ts
- [x] Обновить app/layout.tsx с MantineProvider

#### 0.3 Настройка базы данных
**Статус**: ✅ Выполнено
- [x] Установить Prisma 6.9.0
- [x] Создать полную Prisma схему (из db.example.txt)
- [x] Настроить миграции
- [x] Создать seed скрипты для тестовых данных
- [x] Добавить скрипты для работы с БД в package.json

#### 0.4 Базовая конфигурация
**Статус**: ✅ Выполнено
- [x] Настроить TypeScript paths для FSD
- [x] Создать env.ts и env.example.ts
- [x] Установить и настроить ESLint
- [x] Установить и настроить Prettier
- [x] Настроить husky и lint-staged

#### 0.5 Настройка State Management
**Статус**: ✅ Выполнено
- [x] Установить Zustand 5.0.5
- [x] Установить TanStack Query v5
- [x] Установить React Hook Form 7.57.0
- [x] Установить Zod 4.x
- [x] Создать базовые утилиты для работы с API

#### 0.6 DevOps и CI/CD
**Статус**: ⏳ Ожидает
- [ ] Настроить GitHub Actions для CI
- [ ] Создать скрипты деплоя
- [ ] Настроить PM2 конфигурацию
- [ ] Подготовить production окружение

---

### Этап 1: Авторизация и управление пользователями (7 дней)

#### 1.1 Backend: Auth API
**Статус**: ✅ Выполнено
- [x] Создать Prisma модели: User, AnonymousUser, OtpCode
- [x] Реализовать API endpoints:
  - [x] POST /api/v1/auth/anonymous
  - [x] POST /api/v1/auth/send-otp
  - [x] POST /api/v1/auth/verify-otp
  - [x] POST /api/v1/auth/refresh
  - [x] GET /api/v1/auth/me
  - [x] POST /api/v1/auth/logout
  - [x] GET /api/v1/auth/anonymous-sessions
- [x] Создать middleware для проверки токенов
- [x] Интегрировать SMS.ru для отправки кодов

#### 1.2 Frontend: Авторизация
**Статус**: ✅ Выполнено
- [x] Создать features/auth:
  - [x] login-modal.tsx (Mantine Modal)
  - [x] otp-form.tsx (Mantine Form + PinInput)
  - [x] phone-input.tsx (InputMask)
- [x] Создать auth-store.ts (Zustand)
- [x] Реализовать хуки для работы с API

#### 1.3 Frontend: Панель управления
**Статус**: ✅ Выполнено
- [x] Создать app/panel/layout.tsx
- [x] Создать widgets/panel-layout
- [x] Создать widgets/user-management
- [x] Реализовать таблицу пользователей
- [x] Добавить функции смены роли
- [x] Создать страницу детального просмотра пользователя
- [x] Добавить статистику пользователя (заказы, корзина, избранное)

#### 1.4 Система анонимных пользователей
**Статус**: ✅ Выполнено
- [x] Реализовать генерацию анонимных токенов
- [x] Создать middleware для анонимных пользователей
- [x] Реализовать слияние данных при авторизации
- [x] Настроить сохранение активности
- [x] Добавить отображение анонимных сессий в админке

---

### Этап 2: Каталог товаров - базовый функционал (10 дней)

#### 2.1 Backend: Products & Categories API
**Статус**: ✅ Выполнено
- [x] Создать Prisma модели: Category, Product, Brand, ProductImage
- [x] Реализовать Categories API:
  - [x] GET /api/v1/categories
  - [x] POST /api/v1/categories
  - [x] PATCH /api/v1/categories/[id]
  - [x] DELETE /api/v1/categories/[id]
  - [x] GET /api/v1/categories/tree
  - [x] PUT /api/v1/categories/reorder
- [x] Реализовать Products API:
  - [x] GET /api/v1/products
  - [x] GET /api/v1/products/[id]
  - [x] POST /api/v1/products
  - [x] PATCH /api/v1/products/[id]
  - [x] DELETE /api/v1/products/[id]
  - [x] GET /api/v1/products/search
  - [x] GET /api/v1/products/[id]/related
- [x] Реализовать Brands API:
  - [x] GET /api/v1/brands
  - [x] POST /api/v1/brands
- [x] Добавить поиск и фильтрацию
- [x] Реализовать пагинацию

#### 2.2 Frontend: Управление категориями
**Статус**: ⏳ Ожидает
- [ ] Создать widgets/category-management
- [ ] Реализовать древовидную структуру
- [ ] Добавить Drag & Drop для сортировки
- [ ] Создать форму категории

#### 2.3 Frontend: Управление товарами
**Статус**: ⏳ Ожидает
- [ ] Создать widgets/product-management
- [ ] Создать widgets/product-form
- [ ] Реализовать загрузку изображений (Mantine Dropzone)
- [ ] Добавить выбор категорий
- [ ] Создать таблицу товаров с фильтрами

#### 2.4 Frontend: Публичный каталог
**Статус**: ⏳ Ожидает
- [ ] Создать app/catalog структуру
- [ ] Создать widgets/catalog-page
- [ ] Создать widgets/product-filters
- [ ] Реализовать сетку товаров
- [ ] Добавить фильтры и сортировку

#### 2.5 Frontend: Страница товара
**Статус**: ⏳ Ожидает
- [ ] Создать app/products/[slug]/page.tsx
- [ ] Создать widgets/product-page
- [ ] Создать features/product-gallery
- [ ] Добавить хлебные крошки
- [ ] Реализовать related products

---

### Этап 3: Корзина и избранное (7 дней)

#### 3.1 Backend: Cart & Favorites API
**Статус**: ⏳ Ожидает
- [ ] Создать Prisma модели: Cart, CartItem, Favorite
- [ ] Реализовать Cart API:
  - [ ] GET /api/v1/cart
  - [ ] POST /api/v1/cart/items
  - [ ] PATCH /api/v1/cart/items/[id]
  - [ ] DELETE /api/v1/cart/items/[id]
  - [ ] POST /api/v1/cart/merge
  - [ ] POST /api/v1/cart/calculate
- [ ] Реализовать Favorites API:
  - [ ] GET /api/v1/favorites
  - [ ] POST /api/v1/favorites
  - [ ] DELETE /api/v1/favorites/[productId]
  - [ ] GET /api/v1/favorites/check

#### 3.2 Frontend: Корзина
**Статус**: ⏳ Ожидает
- [ ] Создать entities/cart с Zustand store
- [ ] Создать widgets/cart-page
- [ ] Создать widgets/cart-widget (шапка)
- [ ] Создать features/change-quantity
- [ ] Создать features/remove-from-cart
- [ ] Реализовать синхронизацию между вкладками

#### 3.3 Frontend: Избранное
**Статус**: ⏳ Ожидает
- [ ] Создать entities/favorite с Zustand store
- [ ] Создать widgets/favorites-page
- [ ] Создать features/toggle-favorite
- [ ] Добавить кнопку в карточку товара
- [ ] Реализовать счетчик в шапке

#### 3.4 Синхронизация для анонимных
**Статус**: ⏳ Ожидает
- [ ] Реализовать сохранение корзины для анонимных
- [ ] Реализовать сохранение избранного для анонимных
- [ ] Добавить слияние при авторизации
- [ ] Обработать конфликты при слиянии

---

### Этап 4: Оформление и управление заказами (10 дней)

#### 4.1 Backend: Orders API
**Статус**: ⏳ Ожидает
- [ ] Создать Prisma модели: Order, OrderItem, OrderStatus, DeliveryMethod, PaymentMethod
- [ ] Реализовать Customer endpoints:
  - [ ] POST /api/v1/orders
  - [ ] GET /api/v1/orders
  - [ ] GET /api/v1/orders/[id]
- [ ] Реализовать Admin endpoints:
  - [ ] GET /api/v1/admin/orders
  - [ ] PATCH /api/v1/admin/orders/[id]/status
  - [ ] GET /api/v1/admin/orders/stats
- [ ] Добавить генерацию номера заказа
- [ ] Реализовать резервирование товаров

#### 4.2 Frontend: Оформление заказа
**Статус**: ⏳ Ожидает
- [ ] Создать app/checkout/page.tsx
- [ ] Создать widgets/checkout-page
- [ ] Создать features/checkout-contact-form
- [ ] Создать features/checkout-delivery
- [ ] Создать features/checkout-payment
- [ ] Создать features/checkout-confirm
- [ ] Реализовать пошаговый процесс (Mantine Stepper)

#### 4.3 Frontend: Управление заказами
**Статус**: ⏳ Ожидает
- [ ] Создать widgets/order-management
- [ ] Создать widgets/order-details
- [ ] Реализовать фильтры по статусу и дате
- [ ] Добавить Timeline для истории статусов
- [ ] Создать функцию экспорта в Excel

#### 4.4 Frontend: История заказов
**Статус**: ⏳ Ожидает
- [ ] Создать app/profile/orders структуру
- [ ] Реализовать список заказов пользователя
- [ ] Добавить детальную страницу заказа
- [ ] Реализовать повтор заказа

---

### Этап 5: Характеристики товаров и расширенная фильтрация (7 дней)

#### 5.1 Backend: Characteristics API
**Статус**: ⏳ Ожидает
- [ ] Создать Prisma модели: Characteristic, CharacteristicValue, ProductCharacteristic
- [ ] Реализовать API endpoints:
  - [ ] GET /api/v1/characteristics
  - [ ] POST /api/v1/characteristics
  - [ ] PATCH /api/v1/characteristics/[id]
  - [ ] GET /api/v1/products/[id]/characteristics
  - [ ] PUT /api/v1/products/[id]/characteristics
- [ ] Добавить динамическую фильтрацию
- [ ] Реализовать агрегацию значений

#### 5.2 Frontend: Управление характеристиками
**Статус**: ⏳ Ожидает
- [ ] Создать widgets/characteristic-management
- [ ] Создать widgets/characteristic-form
- [ ] Добавить динамические поля в форму
- [ ] Реализовать привязку к категориям

#### 5.3 Frontend: Характеристики в товарах
**Статус**: ⏳ Ожидает
- [ ] Добавить вкладку в форму товара
- [ ] Реализовать массовое присвоение
- [ ] Создать импорт из Excel

#### 5.4 Frontend: Расширенные фильтры
**Статус**: ⏳ Ожидает
- [ ] Создать features/filter-by-characteristic
- [ ] Создать features/filter-by-price (RangeSlider)
- [ ] Создать features/clear-filters
- [ ] Добавить счетчики товаров в фильтрах
- [ ] Реализовать умную фильтрацию

---

### Этап 6: Автомобильный каталог и применимость (10 дней)

#### 6.1 Backend: Vehicles API
**Статус**: ⏳ Ожидает
- [ ] Создать Prisma модели: VehicleMake, VehicleModel, VehicleGeneration, VehicleModification, VehicleApplication
- [ ] Реализовать Public endpoints:
  - [ ] GET /api/v1/vehicles/makes
  - [ ] GET /api/v1/vehicles/models
  - [ ] GET /api/v1/vehicles/search
  - [ ] GET /api/v1/vehicles/[modificationId]/parts
- [ ] Реализовать Admin endpoints для CRUD
- [ ] Добавить импорт из TecDoc

#### 6.2 Frontend: Управление автокаталогом
**Статус**: ⏳ Ожидает
- [ ] Создать widgets/vehicle-management
- [ ] Реализовать древовидную структуру
- [ ] Создать формы для всех уровней
- [ ] Добавить массовый импорт

#### 6.3 Frontend: Применимость товаров
**Статус**: ⏳ Ожидает
- [ ] Добавить вкладку "Применимость" в товар
- [ ] Реализовать привязку к модификациям
- [ ] Создать массовую привязку
- [ ] Добавить импорт применимости

#### 6.4 Frontend: Выбор автомобиля
**Статус**: ⏳ Ожидает
- [ ] Создать widgets/vehicle-selector
- [ ] Реализовать каскадные селекты
- [ ] Добавить сохранение в localStorage
- [ ] Интегрировать с фильтрами каталога

#### 6.5 Frontend: Каталог по автомобилям
**Статус**: ⏳ Ожидает
- [ ] Создать app/vehicles структуру
- [ ] Реализовать список марок
- [ ] Создать страницы моделей
- [ ] Добавить SEO оптимизацию

---

### Этап 7: Поиск и SEO оптимизация (5 дней)

#### 7.1 Backend: Search API
**Статус**: ⏳ Ожидает
- [ ] Настроить PostgreSQL full-text search
- [ ] Реализовать endpoints:
  - [ ] GET /api/v1/search/suggest
  - [ ] POST /api/v1/search/products
  - [ ] GET /api/v1/search/popular
  - [ ] GET /api/v1/search/history
- [ ] Добавить fuzzy matching
- [ ] Сохранять историю поиска

#### 7.2 Frontend: Поисковая система
**Статус**: ⏳ Ожидает
- [ ] Создать features/search-box
- [ ] Реализовать автокомплит (Mantine Spotlight)
- [ ] Создать widgets/search-page
- [ ] Добавить подсветку найденных слов

#### 7.3 SEO оптимизация
**Статус**: ⏳ Ожидает
- [ ] Добавить SEO поля в модели
- [ ] Настроить динамические meta теги
- [ ] Создать sitemap.xml
- [ ] Добавить структурированные данные
- [ ] Настроить canonical URLs

---

### Этап 8: Система скидок и промокодов (5 дней)

#### 8.1 Backend: Discounts API
**Статус**: ⏳ Ожидает
- [ ] Создать Prisma модели: DiscountRule, PromoCode, PromoCodeUsage
- [ ] Реализовать endpoints:
  - [ ] POST /api/v1/promo/validate
  - [ ] POST /api/v1/cart/apply-promo
  - [ ] Admin CRUD для скидок
- [ ] Добавить логику расчета скидок

#### 8.2 Frontend: Управление скидками
**Статус**: ⏳ Ожидает
- [ ] Создать widgets/discount-management
- [ ] Создать widgets/discount-form
- [ ] Создать widgets/promo-code-management
- [ ] Реализовать генерацию промокодов

#### 8.3 Frontend: Применение скидок
**Статус**: ⏳ Ожидает
- [ ] Создать features/apply-promo-code
- [ ] Добавить поле в корзину
- [ ] Отображать скидки в checkout
- [ ] Показывать экономию

---

### Этап 9: Чат поддержки (10 дней)

#### 9.1 Backend: Chat микросервис
**Статус**: ⏳ Ожидает
- [ ] Создать отдельный сервис на Node.js
- [ ] Настроить Socket.io
- [ ] Интегрировать Redis pub/sub
- [ ] Создать REST API для истории
- [ ] Реализовать сохранение в PostgreSQL

#### 9.2 Frontend: Менеджерский интерфейс
**Статус**: ⏳ Ожидает
- [ ] Создать widgets/manager-chat-list
- [ ] Создать widgets/manager-chat
- [ ] Создать features/send-product-card
- [ ] Добавить уведомления о новых чатах

#### 9.3 Frontend: Виджет чата
**Статус**: ⏳ Ожидает
- [ ] Создать widgets/chat-widget
- [ ] Реализовать плавающий виджет (Mantine Affix)
- [ ] Создать features/send-message
- [ ] Добавить отображение товаров
- [ ] Сохранять историю для анонимных

---

### Этап 10: Импорт/экспорт и интеграции (7 дней)

#### 10.1 Backend: Import/Export API
**Статус**: ⏳ Ожидает
- [ ] Создать Prisma модель ImportJob
- [ ] Реализовать endpoints:
  - [ ] POST /api/v1/admin/import/products
  - [ ] GET /api/v1/admin/import/[id]/status
  - [ ] GET /api/v1/admin/export/products
  - [ ] GET /api/v1/admin/export/orders
- [ ] Добавить парсинг Excel
- [ ] Реализовать batch операции

#### 10.2 Frontend: Интерфейс импорта
**Статус**: ⏳ Ожидает
- [ ] Создать widgets/import-wizard
- [ ] Реализовать пошаговый процесс (Mantine Stepper)
- [ ] Добавить маппинг колонок
- [ ] Показывать прогресс импорта

#### 10.3 Frontend: Экспорт данных
**Статус**: ⏳ Ожидает
- [ ] Добавить кнопки экспорта в таблицы
- [ ] Реализовать выбор полей
- [ ] Поддержать форматы Excel и CSV

#### 10.4 Подготовка интеграций
**Статус**: ⏳ Ожидает
- [ ] Создать заглушку платежной системы
- [ ] Подготовить структуру для 1С
- [ ] Документировать API

---

### Этап 11: Аналитика и отчеты (5 дней)

#### 11.1 Backend: Analytics API
**Статус**: ⏳ Ожидает
- [ ] Создать модели для сбора метрик
- [ ] Реализовать endpoints:
  - [ ] GET /api/v1/admin/analytics/sales
  - [ ] GET /api/v1/admin/analytics/products
  - [ ] GET /api/v1/admin/analytics/customers
  - [ ] GET /api/v1/admin/analytics/conversion
  - [ ] GET /api/v1/admin/analytics/anonymous
  - [ ] GET /api/v1/admin/analytics/user-journey
- [ ] Добавить агрегацию данных

#### 11.2 Frontend: Dashboard
**Статус**: ⏳ Ожидает
- [ ] Создать widgets/analytics-dashboard
- [ ] Интегрировать @mantine/charts
- [ ] Создать виджеты статистики
- [ ] Добавить фильтры по датам

#### 11.3 Frontend: Отчеты
**Статус**: ⏳ Ожидает
- [ ] Создать систему генерации отчетов
- [ ] Добавить экспорт в PDF
- [ ] Реализовать отправку по email

#### 11.4 Метрики и трекинг
**Статус**: ⏳ Ожидает
- [ ] Интегрировать Яндекс.Метрику
- [ ] Настроить e-commerce события
- [ ] Добавить цели и конверсии

---

### Этап 12: PWA и мобильная оптимизация (5 дней)

#### 12.1 PWA функциональность
**Статус**: ⏳ Ожидает
- [ ] Создать Service Worker
- [ ] Настроить кеширование
- [ ] Добавить offline страницу
- [ ] Реализовать background sync

#### 12.2 Manifest и установка
**Статус**: ⏳ Ожидает
- [ ] Создать manifest.json
- [ ] Добавить иконки для всех платформ
- [ ] Создать splash screens
- [ ] Реализовать install prompt

#### 12.3 Мобильная оптимизация
**Статус**: ⏳ Ожидает
- [ ] Оптимизировать touch интерфейс
- [ ] Добавить swipe жесты
- [ ] Упростить мобильную навигацию
- [ ] Оптимизировать производительность

---

### Этап 13: Безопасность и финальная оптимизация (5 дней)

#### 13.1 Безопасность
**Статус**: ⏳ Ожидает
- [ ] Настроить Security headers
- [ ] Добавить rate limiting
- [ ] Провести аудит безопасности
- [ ] Настроить CORS политики

#### 13.2 Оптимизация производительности
**Статус**: ⏳ Ожидает
- [ ] Оптимизировать database queries
- [ ] Настроить индексы
- [ ] Добавить Redis кеширование
- [ ] Настроить CDN

#### 13.3 Финальное тестирование
**Статус**: ⏳ Ожидает
- [ ] Провести нагрузочное тестирование
- [ ] Проверить Core Web Vitals
- [ ] Достичь Lighthouse score > 90
- [ ] Исправить критические баги

#### 13.4 Документация
**Статус**: ⏳ Ожидает
- [ ] Создать API документацию (Swagger)
- [ ] Написать Deployment guide
- [ ] Создать руководство администратора
- [ ] Подготовить видео-инструкции

---

## Метрики успеха MVP

- [ ] Lighthouse Performance Score > 90
- [ ] Time to Interactive < 3 секунд
- [ ] Полная функциональность корзины и заказов
- [ ] Работающий поиск по каталогу
- [ ] SMS авторизация
- [ ] Базовая админ-панель
- [ ] Мобильная адаптация
- [ ] SEO оптимизация

## Следующие шаги после MVP

1. **Фаза 2: Рост и масштабирование (2-3 месяца)**
   - Переход к микросервисам
   - Elasticsearch для поиска
   - Notification Service
   - Image Processing Service

2. **Фаза 3: Расширенные интеграции (1-2 месяца)**
   - 1С синхронизация
   - Маркетплейсы API
   - TecDoc каталог
   - Службы доставки

3. **Фаза 4: Machine Learning (2-3 месяца)**
   - Рекомендательная система
   - Предсказание спроса
   - Динамическое ценообразование
   - Чат-бот с NLP

4. **Фаза 5: Kubernetes и Cloud (2-3 месяца)**
   - Контейнеризация
   - K8s deployment
   - Auto-scaling
   - GitOps

---

## Примечания

- Каждый этап включает полный цикл: Backend API → Frontend админка → Frontend публичная часть
- После каждого этапа проводится демонстрация результатов
- Приоритет отдается вертикальным срезам функциональности
- Код должен соответствовать принципам FSD с первого дня
- Все компоненты UI берутся из Mantine для консистентности