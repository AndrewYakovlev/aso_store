# Техническое задание на поэтапную разработку интернет-магазина автозапчастей "Автозапчасти АСО"

## 1. Общие положения

### 1.1 Принцип разработки

Проект разрабатывается по принципу вертикальных срезов функциональности. Каждый этап включает:

1. Backend API в Next.js 15
2. Frontend административной панели
3. Frontend публичной части
4. Деплой и демонстрация результатов

### 1.2 Технологический стек

#### Backend (API Routes в Next.js 15):

- **Framework**: Next.js 15.2.3+ (App Router)
- **ORM**: Prisma 6.9.0
- **База данных**: PostgreSQL 17
- **Кеширование**: Redis 8.0.2
- **Валидация**: Zod 4.x
- **Аутентификация**: JWT + httpOnly cookies

#### Frontend:

- **UI Library**: React 19
- **UI Components**: Mantine UI 8.1.0+
- **Стилизация**: Tailwind CSS 4.1 (для утилит) + Mantine themes
- **State Management**: Zustand 5.0.5 + TanStack Query v5
- **Формы**: React Hook Form 7.57.0 + Zod 4.x + @mantine/form
- **Архитектура**: Feature-Sliced Design (FSD)

#### Инфраструктура:

- **Хостинг**: VPS Ubuntu 22.04
- **Процесс-менеджер**: PM2
- **Reverse-proxy**: Nginx
- **CI/CD**: GitHub Actions
- **Примечание**: Все сервисы (PostgreSQL, Redis, Node.js) устанавливаются напрямую на сервер без использования Docker

## 2. Этап 0: Базовая инфраструктура (5 дней)

### 2.1 Настройка окружения разработки

#### 2.1.1 Инициализация проекта

**Задача**: Создать монорепозиторий с правильной структурой

```
auto-parts-store/
├── app/                    # Next.js 15 App Router (только роутинг)
├── widgets/                # Самостоятельные блоки UI
├── features/               # Пользовательские сценарии
├── entities/               # Бизнес-сущности
├── shared/                 # Переиспользуемый код
│   ├── ui/                # UI компоненты и обертки Mantine
│   ├── lib/               # Библиотеки и утилиты
│   ├── types/             # TypeScript типы
│   └── constants/         # Константы
├── prisma/
│   ├── schema.prisma      # Единая схема БД
│   └── migrations/
├── postcss.config.cjs     # Конфигурация PostCSS для Mantine
├── .gitignore             # Включает env.ts
├── env.example.ts         # Пример конфигурации
└── package.json
```

**Правила FSD**:

- `app/` - только файлы роутинга Next.js (page.tsx, layout.tsx, route.ts)
- Вся бизнес-логика выносится в соответствующие FSD слои
- Импорты идут только сверху вниз: widgets → features → entities → shared
- Каждый слой имеет стандартную структуру: ui/, model/, api/, lib/

**Интеграция Mantine с FSD**:

```
shared/
├── ui/
│   ├── mantine/           # Кастомизированные обертки над Mantine
│   │   ├── button.tsx
│   │   ├── table.tsx
│   │   └── theme.ts       # Настройки темы Mantine
│   └── custom/            # Полностью кастомные компоненты
```

**Примечание**: Tailwind CSS остается в проекте для утилитарных классов (spacing, flexbox, grid), но основные компоненты берутся из Mantine для консистентности дизайна.

#### 2.1.2 Настройка базы данных

**Backend задачи**:

- Установка PostgreSQL 17 и Redis 8.0.2 локально для разработки
- Полная Prisma схема со всеми таблицами (см. приложенную схему)
- Настройка миграций
- Seed скрипты для тестовых данных

#### 2.1.3 Конфигурация Next.js

**Задачи**:

- Настройка TypeScript (без strict mode на этапе MVP)
- Конфигурация путей импорта
- Настройка ESLint и Prettier
- Создание `env.ts` для конфигурации (исключен из git)
- Создание `env.example.ts` как шаблон конфигурации
- Настройка PostCSS для Mantine
- Настройка Mantine Provider в корневом layout
- Архитектура FSD подразумевается, но структура создается по мере необходимости

**Mantine пакеты для установки**:

```json
{
  "@mantine/core": "^8.1.0",
  "@mantine/hooks": "^8.1.0",
  "@mantine/form": "^8.1.0",
  "@mantine/dates": "^8.1.0",
  "@mantine/notifications": "^8.1.0",
  "@mantine/modals": "^8.1.0",
  "@mantine/spotlight": "^8.1.0",
  "@mantine/dropzone": "^8.1.0",
  "@mantine/charts": "^8.1.0",
  "@mantine/carousel": "^8.1.0",
  "@mantine/code-highlight": "^8.1.0",
  "postcss-preset-mantine": "^1.17.0",
  "postcss-simple-vars": "^7.0.1"
}
```

**Пример app/layout.tsx с Mantine**:

```typescript
import { MantineProvider } from "@mantine/core"
import { Notifications } from "@mantine/notifications"
import { ModalsProvider } from "@mantine/modals"
import { theme } from "@/shared/ui/mantine/theme"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body>
        <MantineProvider theme={theme}>
          <ModalsProvider>
            <Notifications />
            {children}
          </ModalsProvider>
        </MantineProvider>
      </body>
    </html>
  )
}
```

**Пример postcss.config.cjs**:

```javascript
module.exports = {
  plugins: {
    "postcss-preset-mantine": {},
    "postcss-simple-vars": {
      variables: {
        "mantine-breakpoint-xs": "36em",
        "mantine-breakpoint-sm": "48em",
        "mantine-breakpoint-md": "62em",
        "mantine-breakpoint-lg": "75em",
        "mantine-breakpoint-xl": "88em",
      },
    },
  },
}
```

**Пример env.example.ts**:

```typescript
export const config = {
  database: {
    url: "postgresql://user:password@localhost:5432/aso_dev",
  },
  redis: {
    host: "localhost",
    port: 6379,
  },
  jwt: {
    secret: "your-jwt-secret",
    expiresIn: "7d",
  },
  sms: {
    apiKey: "your-sms-ru-api-key",
  },
}
```

**Пример tsconfig.json paths**:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "@/widgets/*": ["./widgets/*"],
      "@/features/*": ["./features/*"],
      "@/entities/*": ["./entities/*"],
      "@/shared/*": ["./shared/*"]
    }
  }
}
```

**Примечание по FSD**: На начальных этапах допускается упрощенная структура с постепенной миграцией на полноценную FSD архитектуру по мере роста проекта. Главное - соблюдать принцип разделения бизнес-логики и UI с самого начала.

### 2.2 Настройка VPS

#### 2.2.1 Базовая настройка сервера

**DevOps задачи**:

- Настройка Ubuntu 22.04
- Установка Node.js (через nvm), PostgreSQL 17, Redis 8.0.2, Nginx
- Настройка systemd сервисов для PostgreSQL и Redis
- Настройка firewall и fail2ban
- SSL сертификаты через Let's Encrypt
- Настройка GitHub Actions для деплоя

#### 2.2.2 CI/CD Pipeline

**Файл**: `.github/workflows/deploy.yml`
**Функциональность**:

- Автоматический деплой при push в main
- Запуск миграций
- Перезапуск PM2 процессов
- Уведомления о статусе

**Результат этапа**: Настроенное окружение разработки и production сервер, готовый к деплою. Mantine UI полностью интегрирован с поддержкой темизации и всех необходимых компонентов.

## 3. Этап 1: Авторизация и управление пользователями (7 дней)

### User Flow для анонимных и авторизованных пользователей

#### Анонимный пользователь:

1. **Первое посещение**:

   - При первом заходе на сайт middleware проверяет наличие cookie с анонимным токеном
   - Если cookie отсутствует - генерируется уникальный токен (случайная строка)
   - Создается запись AnonymousUser в БД
   - Токен сохраняется в httpOnly cookie на 365 дней

2. **Последующие посещения**:

   - Middleware проверяет валидность токена из cookie
   - Если токен валиден - продлевает cookie еще на 365 дней
   - Если токен невалиден или истек - генерируется новый

3. **Сохраняемые данные**:
   - Корзина товаров
   - Избранные товары
   - История поиска
   - История просмотра товаров
   - Чаты с менеджерами

#### Процесс авторизации:

1. **Связывание с анонимной сессией**:
   - При успешной авторизации анонимный пользователь связывается с учетной записью
   - Все накопленные данные сохраняются и привязываются к пользователю
   - История не очищается для аналитики
   - Возможность связать несколько анонимных сессий с одним пользователем

### 3.1 Backend: Auth API

#### 3.1.1 Prisma схема для пользователей

```prisma
model User {
  id               String    @id @default(cuid())
  phone            String    @unique
  email            String?
  firstName        String?
  lastName         String?
  role             UserRole  @default(CUSTOMER)
  phoneVerified    Boolean   @default(false)
  emailVerified    Boolean   @default(false)
  lastLoginAt      DateTime?
  lastActivityAt   DateTime  @default(now())
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  anonymousSessions AnonymousUser[]
}

model AnonymousUser {
  id           String    @id @default(cuid())
  token        String    @unique
  sessionId    String    @unique
  ipAddress    String?
  userAgent    String?
  userId       String?   // Связь с User после авторизации
  user         User?     @relation(fields: [userId], references: [id])
  createdAt    DateTime  @default(now())
  lastActivity DateTime  @default(now())
}

model OtpCode {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  code      String
  attempts  Int      @default(0)
  expiresAt DateTime
  createdAt DateTime @default(now())
}
```

#### 3.1.2 API Routes реализация

**Endpoints**:

- `POST /api/v1/auth/anonymous` - получение анонимного токена
- `POST /api/v1/auth/send-otp` - отправка SMS с кодом
- `POST /api/v1/auth/verify-otp` - проверка кода и авторизация
  - Автоматически связывает текущего анонимного пользователя с учетной записью
  - Объединяет корзину, избранное и другие данные
- `POST /api/v1/auth/refresh` - обновление токенов
- `GET /api/v1/auth/me` - данные текущего пользователя
- `POST /api/v1/auth/logout` - выход
- `GET /api/v1/auth/anonymous-sessions` - список анонимных сессий пользователя (для аналитики)

#### 3.1.3 Middleware и утилиты

**Файлы**:

- `middleware.ts` - проверка анонимных и авторизованных токенов (в корне проекта)
  - Проверка наличия анонимного токена в cookie
  - Валидация токена в БД
  - Генерация нового токена при необходимости
  - Продление срока действия cookie на 365 дней
  - Проверка JWT токена для авторизованных пользователей
- `shared/lib/auth.ts` - утилиты для работы с JWT и анонимными токенами
- `shared/lib/sms.ts` - интеграция с SMS.ru
- `shared/lib/anonymous.ts` - работа с анонимными пользователями

### 3.2 Frontend: Панель управления

#### 3.2.1 Layout административной панели

**Структура FSD**:

```
widgets/
├── panel-layout/
│   ├── ui/
│   │   ├── index.tsx
│   │   ├── navigation.tsx
│   │   └── header.tsx
│   └── model/
│       └── panel-store.ts

app/panel/
└── layout.tsx              # Использует PanelLayout из widgets
```

**Файлы**:

- `app/panel/layout.tsx` - Next.js layout, импортирует виджет
- `widgets/panel-layout` - виджет административной панели
- `widgets/panel-layout/ui/navigation.tsx` - боковое меню
- `widgets/panel-layout/ui/header.tsx` - шапка с информацией о пользователе

#### 3.2.2 Управление пользователями

**Структура FSD**:

```
widgets/
├── user-management/
│   ├── ui/
│   │   ├── index.tsx
│   │   ├── user-table.tsx
│   │   └── user-filters.tsx
│   ├── api/
│   │   └── user-queries.ts
│   └── model/
│       └── user-filters-store.ts

features/
├── change-user-role/
│   ├── ui/
│   │   └── change-role-button.tsx
│   └── api/
│       └── change-role.ts

entities/
├── user/
│   ├── ui/
│   │   ├── user-card.tsx
│   │   └── user-badge.tsx
│   └── model/
│       └── types.ts
```

**Страницы**:

- `app/panel/users/page.tsx` - использует UserManagementWidget
- `app/panel/users/[id]/page.tsx` - использует UserDetailsWidget
- `widgets/user-management` - виджет управления пользователями
- `features/change-user-role` - фича смены роли

**Функциональность**:

- Таблица пользователей с пагинацией
- Поиск по телефону/email
- Смена роли пользователя
- Просмотр активности
- Список связанных анонимных сессий
- История действий до авторизации

### 3.3 Frontend: Публичная часть

#### 3.3.1 Компоненты авторизации

**Структура FSD**:

```
features/
├── auth/
│   ├── ui/
│   │   ├── login-modal.tsx      # Modal из Mantine
│   │   ├── otp-form.tsx         # TextInput и PinInput из Mantine
│   │   └── phone-input.tsx      # InputMask из Mantine
│   ├── model/
│   │   ├── auth-store.ts
│   │   └── use-auth.ts
│   └── api/
│       ├── send-otp.ts
│       └── verify-otp.ts
```

**Реализация**:

- `features/auth/ui/login-modal.tsx` - модальное окно входа (Mantine Modal)
- `features/auth/ui/otp-form.tsx` - форма ввода телефона и кода (Mantine Form + Zod)
- `features/auth/model/auth-store.ts` - Zustand store для состояния авторизации
- `features/auth/api/` - функции для работы с API

#### 3.3.2 Защищенные страницы

**Страницы**:

- `app/profile/page.tsx` - личный кабинет
- `app/profile/layout.tsx` - layout с проверкой авторизации
- `middleware.ts` - редирект неавторизованных

**Результат этапа**: Работающая система авторизации через SMS, управление пользователями в админке, личный кабинет, система анонимных пользователей с сохранением их активности

## 4. Этап 2: Каталог товаров - базовый функционал (10 дней)

### 4.1 Backend: Products & Categories API

#### 4.1.1 Расширение Prisma схемы

```prisma
model Category {
  id          String    @id @default(cuid())
  name        String
  slug        String    @unique
  description String?
  parentId    String?
  parent      Category? @relation("CategoryToCategory", fields: [parentId], references: [id])
  children    Category[] @relation("CategoryToCategory")
  sortOrder   Int       @default(0)
  isActive    Boolean   @default(true)
  products    ProductCategory[]
}

model Product {
  id              String    @id @default(cuid())
  name            String
  slug            String    @unique
  description     String?
  sku             String    @unique
  price           Decimal
  comparePrice    Decimal?
  stock           Int       @default(0)
  weight          Decimal?  @db.Decimal(10, 3)
  dimensions      Json?
  minOrderQuantity Int?     @default(1)
  brandId         String
  brand           Brand     @relation(fields: [brandId], references: [id])
  isActive        Boolean   @default(true)
  categories      ProductCategory[]
  images          ProductImage[]
  tags            ProductTag[]
}
```

#### 4.1.2 CRUD endpoints

**Categories API**:

- `GET /api/v1/categories` - список/дерево категорий
- `POST /api/v1/categories` - создание (admin)
- `PATCH /api/v1/categories/[id]` - обновление (admin)
- `DELETE /api/v1/categories/[id]` - удаление (admin)

**Products API**:

- `GET /api/v1/products` - список с фильтрацией
- `GET /api/v1/products/[id]` - детали товара
- `POST /api/v1/products` - создание (admin)
- `PATCH /api/v1/products/[id]` - обновление (admin)
- `DELETE /api/v1/products/[id]` - удаление (admin)

#### 4.1.3 Поиск и фильтрация

**Функциональность**:

- Полнотекстовый поиск по названию и описанию
- Фильтры по категории, бренду, цене, наличию
- Сортировка по цене, названию, дате
- Пагинация с курсором

### 4.2 Frontend: Панель управления

#### 4.2.1 Управление категориями

**Структура FSD**:

```
widgets/
├── category-management/
│   ├── ui/
│   │   ├── index.tsx
│   │   ├── category-tree.tsx
│   │   └── category-form.tsx
│   └── model/
│       └── category-tree-store.ts

features/
├── drag-drop-category/
├── toggle-category-status/
└── delete-category/

entities/
├── category/
│   ├── ui/
│   │   └── category-item.tsx
│   └── model/
│       └── types.ts
```

**Страницы**:

- `app/panel/categories/page.tsx` - использует CategoryManagementWidget
- `app/panel/categories/new/page.tsx` - использует CategoryFormWidget
- `app/panel/categories/[id]/page.tsx` - использует CategoryFormWidget

**Функциональность**:

- Drag & Drop для изменения порядка
- Вложенные категории
- Массовая активация/деактивация

#### 4.2.2 Управление товарами

**Структура FSD**:

```
widgets/
├── product-management/
│   ├── ui/
│   │   ├── index.tsx
│   │   ├── product-table.tsx    # Mantine DataTable
│   │   └── product-filters.tsx  # MultiSelect, RangeSlider
│   └── model/
│       └── product-filters-store.ts
├── product-form/
│   ├── ui/
│   │   ├── index.tsx
│   │   ├── basic-info-step.tsx  # TextInput, NumberInput, Textarea
│   │   ├── images-step.tsx      # Dropzone
│   │   └── categories-step.tsx  # Checkbox.Group
│   └── model/
│       └── product-form-store.ts

features/
├── upload-product-image/         # Mantine Dropzone
├── select-categories/            # Tree select
└── delete-product/               # Confirmation modal

entities/
├── product/
│   ├── ui/
│   │   ├── product-card.tsx
│   │   └── product-row.tsx
│   └── model/
│       └── types.ts
```

**Страницы**:

- `app/panel/products/page.tsx` - использует ProductManagementWidget
- `app/panel/products/new/page.tsx` - использует ProductFormWidget
- `app/panel/products/[id]/page.tsx` - использует ProductFormWidget

**Компоненты Mantine**:

- `widgets/product-form` - форма товара с валидацией (@mantine/form)
- `features/upload-product-image` - загрузка изображений (Dropzone)
- `features/select-categories` - выбор категорий (Checkbox.Group)

### 4.3 Frontend: Публичная часть

#### 4.3.1 Страница каталога

**Структура FSD**:

```
widgets/
├── catalog-page/
│   ├── ui/
│   │   ├── index.tsx
│   │   ├── sidebar-filters.tsx
│   │   └── product-grid.tsx
│   └── model/
│       └── catalog-store.ts
├── product-filters/
│   ├── ui/
│   │   ├── index.tsx
│   │   ├── price-filter.tsx
│   │   ├── brand-filter.tsx
│   │   └── category-filter.tsx
│   └── model/
│       └── filters-store.ts

features/
├── apply-filters/
├── sort-products/
└── load-more-products/
```

**Реализация**:

- `app/catalog/page.tsx` - использует CatalogPageWidget
- `app/catalog/[...slug]/page.tsx` - использует CatalogPageWidget с категорией
- `widgets/product-filters` - панель фильтров
- `widgets/catalog-page` - основной виджет каталога

#### 4.3.2 Страница товара

**Структура FSD**:

```
widgets/
├── product-page/
│   ├── ui/
│   │   ├── index.tsx
│   │   ├── product-info.tsx
│   │   └── related-products.tsx
│   └── model/
│       └── product-page-store.ts

features/
├── product-gallery/
│   ├── ui/
│   │   ├── index.tsx
│   │   ├── thumbnail-list.tsx
│   │   └── main-image.tsx
│   └── model/
│       └── gallery-store.ts
├── add-to-cart/
└── toggle-favorite/

entities/
├── product/
│   ├── ui/
│   │   ├── product-price.tsx
│   │   ├── product-badge.tsx
│   │   └── product-specifications.tsx
│   └── api/
│       └── product-api.ts
```

**Компоненты**:

- `app/products/[slug]/page.tsx` - использует ProductPageWidget
- `widgets/product-page` - основной виджет страницы товара
- `features/product-gallery` - галерея изображений
- `entities/product/ui/` - базовые компоненты товара

**Результат этапа**: Работающий каталог с управлением товарами, категориями, базовым поиском и фильтрацией

## 5. Этап 3: Корзина и избранное (7 дней)

### 5.1 Backend: Cart & Favorites API

#### 5.1.1 Расширение схемы

```prisma
model Cart {
  id             String    @id @default(cuid())
  userId         String?
  user           User?     @relation(fields: [userId], references: [id])
  anonymousId    String?
  anonymousUser  AnonymousUser? @relation(fields: [anonymousId], references: [id])
  items          CartItem[]
  updatedAt      DateTime  @updatedAt
}

model CartItem {
  id              String    @id @default(cuid())
  cartId          String
  cart            Cart      @relation(fields: [cartId], references: [id])
  productId       String
  product         Product   @relation(fields: [productId], references: [id])
  quantity        Int
  price           Decimal
}

model Favorite {
  id            String         @id @default(cuid())
  userId        String?
  user          User?          @relation(fields: [userId], references: [id])
  anonymousId   String?
  anonymousUser AnonymousUser? @relation(fields: [anonymousId], references: [id])
  productId     String
  product       Product        @relation(fields: [productId], references: [id])
  @@unique([userId, productId])
  @@unique([anonymousId, productId])
}
```

#### 5.1.2 Cart API endpoints

**Endpoints**:

- `GET /api/v1/cart` - получить корзину
- `POST /api/v1/cart/items` - добавить товар
- `PATCH /api/v1/cart/items/[id]` - изменить количество
- `DELETE /api/v1/cart/items/[id]` - удалить товар
- `POST /api/v1/cart/merge` - слияние корзин при авторизации
- `POST /api/v1/cart/calculate` - расчет стоимости

#### 5.1.3 Favorites API

**Endpoints**:

- `GET /api/v1/favorites` - список избранного
- `POST /api/v1/favorites` - добавить в избранное
- `DELETE /api/v1/favorites/[productId]` - удалить
- `GET /api/v1/favorites/check` - проверка списка товаров

### 5.2 Frontend: Панель управления

#### 5.2.1 Просмотр корзин

**Функциональность**:

- `app/panel/carts/page.tsx` - активные корзины
- Просмотр брошенных корзин
- Статистика по корзинам
- Возможность связаться с клиентом

### 5.3 Frontend: Публичная часть

#### 5.3.1 Корзина

**Структура FSD**:

```
widgets/
├── cart-page/
│   ├── ui/
│   │   ├── index.tsx
│   │   ├── cart-items-list.tsx
│   │   └── cart-summary.tsx
│   └── model/
│       └── cart-page-store.ts
├── cart-widget/
│   ├── ui/
│   │   ├── index.tsx
│   │   └── mini-cart.tsx
│   └── model/
│       └── use-cart-widget.ts

features/
├── change-quantity/
├── remove-from-cart/
└── apply-promo-code/

entities/
├── cart/
│   ├── ui/
│   │   └── cart-item.tsx
│   ├── model/
│   │   ├── cart-store.ts
│   │   └── types.ts
│   └── api/
│       └── cart-api.ts
```

**Компоненты**:

- `app/cart/page.tsx` - использует CartPageWidget
- `widgets/cart-widget` - виджет в шапке
- `entities/cart/ui/cart-item.tsx` - элемент корзины
- `entities/cart/model/cart-store.ts` - Zustand store

#### 5.3.2 Избранное

**Структура FSD**:

```
widgets/
├── favorites-page/
│   ├── ui/
│   │   ├── index.tsx
│   │   └── favorites-grid.tsx
│   └── model/
│       └── favorites-page-store.ts

features/
├── toggle-favorite/
│   ├── ui/
│   │   └── favorite-button.tsx
│   ├── model/
│   │   └── use-favorite.ts
│   └── api/
│       └── favorite-api.ts

entities/
├── favorite/
│   ├── model/
│   │   ├── favorites-store.ts
│   │   └── types.ts
│   └── api/
│       └── favorites-api.ts
```

**Реализация**:

- `app/profile/favorites/page.tsx` - использует FavoritesPageWidget (для авторизованных)
- `features/toggle-favorite/ui/favorite-button.tsx` - кнопка добавления
- Поддержка избранного для анонимных пользователей
- Синхронизация между вкладками
- Объединение избранного при авторизации

**Результат этапа**: Полнофункциональная корзина с синхронизацией, избранное для авторизованных и анонимных пользователей, объединение данных при авторизации

## 6. Этап 4: Оформление и управление заказами (10 дней)

### 6.1 Backend: Orders API

#### 6.1.1 Схема заказов

```prisma
model Order {
  id                 String    @id @default(cuid())
  orderNumber        String    @unique
  invoiceNumber      String?   @unique
  userId             String
  user               User      @relation(fields: [userId], references: [id])
  status             OrderStatus @default(NEW)
  subtotal           Decimal
  shippingAmount     Decimal   @default(0)
  totalAmount        Decimal
  deliveryMethod     String
  paymentMethod      String
  shippingAddress    Json
  comment            String?
  items              OrderItem[]
  statusHistory      OrderStatusHistory[]
  createdAt          DateTime  @default(now())
}

model OrderItem {
  id              String    @id @default(cuid())
  orderId         String
  order           Order     @relation(fields: [orderId], references: [id])
  productId       String
  product         Product   @relation(fields: [productId], references: [id])
  quantity        Int
  price           Decimal
  total           Decimal
}
```

#### 6.1.2 Orders endpoints

**Customer endpoints**:

- `POST /api/v1/orders` - создание заказа из корзины
- `GET /api/v1/orders` - история заказов пользователя
- `GET /api/v1/orders/[id]` - детали заказа

**Admin endpoints**:

- `GET /api/v1/admin/orders` - все заказы с фильтрацией
- `PATCH /api/v1/admin/orders/[id]/status` - изменение статуса
- `GET /api/v1/admin/orders/stats` - статистика заказов

#### 6.1.3 Бизнес-логика

**Функции**:

- Генерация уникального номера заказа
- Проверка наличия товаров
- Резервирование товаров
- Email уведомления о статусе
- Интеграция с платежными системами (заглушка)

### 6.2 Frontend: Панель управления

#### 6.2.1 Управление заказами

**Структура FSD**:

```
widgets/
├── order-management/
│   ├── ui/
│   │   ├── index.tsx
│   │   ├── orders-table.tsx      # DataTable с сортировкой
│   │   └── order-filters.tsx     # DatePickerInput с пресетами
│   └── model/
│       └── orders-store.ts
├── order-details/
│   ├── ui/
│   │   ├── index.tsx
│   │   ├── order-info.tsx        # Timeline для статусов
│   │   ├── order-items.tsx       # Table с NumberFormatter
│   │   └── status-timeline.tsx   # Mantine Timeline
│   └── model/
│       └── order-details-store.ts

features/
├── change-order-status/           # Select со статусами
├── export-orders/                 # Button с loading state
└── print-order/                   # ActionIcon

entities/
├── order/
│   ├── ui/
│   │   ├── order-card.tsx
│   │   └── order-status-badge.tsx # Badge компонент
│   └── model/
│       └── types.ts
```

**Страницы**:

- `app/panel/orders/page.tsx` - использует OrderManagementWidget
- `app/panel/orders/[id]/page.tsx` - использует OrderDetailsWidget
- `features/change-order-status` - смена статуса заказа

**Функциональность с Mantine**:

- Фильтры по статусу, дате, сумме (DateRangePicker с пресетами)
- Поиск по номеру заказа (Spotlight)
- Экспорт в Excel (notifications при успехе)
- Печать документов

#### 6.2.2 Dashboard с метриками

**Компоненты**:

- `app/panel/page.tsx` - обновленный dashboard
- `widgets/order-stats` - статистика заказов
- `widgets/revenue-chart` - график выручки

### 6.3 Frontend: Публичная часть

#### 6.3.1 Оформление заказа

**Структура FSD**:

```
widgets/
├── checkout-page/
│   ├── ui/
│   │   ├── index.tsx
│   │   ├── checkout-steps.tsx
│   │   └── order-summary.tsx
│   ├── model/
│   │   └── checkout-store.ts
│   └── lib/
│       └── checkout-validator.ts

features/
├── checkout-contact-form/
│   ├── ui/
│   │   └── contact-form.tsx
│   └── model/
│       └── use-contact-form.ts
├── checkout-delivery/
│   ├── ui/
│   │   └── delivery-methods.tsx
│   └── api/
│       └── calculate-delivery.ts
├── checkout-payment/
│   └── ui/
│       └── payment-methods.tsx
└── checkout-confirm/
    └── ui/
        └── order-review.tsx
```

**Страницы**:

- `app/checkout/page.tsx` - использует CheckoutPageWidget
- `features/checkout-contact-form` - контактные данные
- `features/checkout-delivery` - способ доставки
- `features/checkout-payment` - способ оплаты
- `features/checkout-confirm` - подтверждение

#### 6.3.2 История заказов

**Реализация**:

- `app/profile/orders/page.tsx` - список заказов
- `app/profile/orders/[id]/page.tsx` - детали заказа
- Отслеживание статуса
- Повтор заказа

**Результат этапа**: Полный цикл оформления заказа, управление заказами в админке, история заказов

## 7. Этап 5: Характеристики товаров и расширенная фильтрация (7 дней)

### 7.1 Backend: Characteristics API

#### 7.1.1 Схема характеристик

```prisma
model Characteristic {
  id                String    @id @default(cuid())
  name              String
  code              String    @unique
  type              String    // text, number, boolean, select
  unit              String?
  isFilterable      Boolean   @default(false)
  categories        CharacteristicCategory[]
  values            CharacteristicValue[]
  products          ProductCharacteristic[]
}

model ProductCharacteristic {
  id                      String    @id @default(cuid())
  productId               String
  product                 Product   @relation(fields: [productId], references: [id])
  characteristicId        String
  characteristic          Characteristic @relation(fields: [characteristicId], references: [id])
  value                   String?
  valueId                 String?
  @@unique([productId, characteristicId])
}
```

#### 7.1.2 API endpoints

**Characteristics**:

- `GET /api/v1/characteristics` - список характеристик
- `POST /api/v1/characteristics` - создание
- `PATCH /api/v1/characteristics/[id]` - обновление
- `GET /api/v1/products/[id]/characteristics` - характеристики товара
- `PUT /api/v1/products/[id]/characteristics` - установка характеристик

#### 7.1.3 Расширенная фильтрация

**Функциональность**:

- Динамические фильтры по характеристикам
- Агрегация доступных значений
- Подсчет товаров для каждого фильтра
- Умная фильтрация (скрытие недоступных опций)

### 7.2 Frontend: Панель управления

#### 7.2.1 Управление характеристиками

**Структура FSD**:

```
widgets/
├── characteristic-management/
│   ├── ui/
│   │   ├── index.tsx
│   │   └── characteristics-table.tsx
│   └── model/
│       └── characteristics-store.ts
├── characteristic-form/
│   ├── ui/
│   │   ├── index.tsx
│   │   └── dynamic-fields.tsx
│   └── model/
│       └── form-store.ts

features/
├── create-characteristic/
├── edit-characteristic/
└── delete-characteristic/

entities/
├── characteristic/
│   ├── ui/
│   │   └── characteristic-badge.tsx
│   └── model/
│       └── types.ts
```

**Страницы**:

- `app/panel/characteristics/page.tsx` - использует CharacteristicManagementWidget
- `app/panel/characteristics/new/page.tsx` - использует CharacteristicFormWidget
- `widgets/characteristic-form` - форма с динамическими полями

#### 7.2.2 Характеристики в товарах

**Обновления**:

- Вкладка характеристик в форме товара
- Массовое присвоение характеристик
- Импорт характеристик из Excel

### 7.3 Frontend: Публичная часть

#### 7.3.1 Расширенные фильтры

**Структура FSD**:

```
features/
├── filter-by-characteristic/
│   ├── ui/
│   │   ├── characteristic-filter.tsx  # Checkbox.Group или Select
│   │   └── filter-value-list.tsx      # List с чекбоксами
│   └── model/
│       └── use-characteristic-filter.ts
├── filter-by-price/
│   ├── ui/
│   │   └── price-range-slider.tsx     # RangeSlider из Mantine
│   └── model/
│       └── use-price-filter.ts
├── clear-filters/
│   └── ui/
│       └── applied-filters.tsx        # Chip.Group с закрытием
```

**Компоненты Mantine для фильтров**:

- `RangeSlider` - диапазон цен с форматированием
- `Checkbox.Group` - множественный выбор
- `Chip.Group` - отображение активных фильтров
- `Collapse` - сворачиваемые группы фильтров
- `Badge` - количество товаров в фильтре

#### 7.3.2 Отображение характеристик

**Обновления**:

- Таблица характеристик на странице товара
- Сравнение товаров по характеристикам
- Фильтры в мобильной версии

**Результат этапа**: Гибкая система характеристик, расширенная фильтрация товаров

## 8. Этап 6: Автомобильный каталог и применимость (10 дней)

### 8.1 Backend: Vehicles API

#### 8.1.1 Схема автокаталога

```prisma
model VehicleMake {
  id        String    @id @default(cuid())
  name      String
  slug      String    @unique
  country   String?
  models    VehicleModel[]
}

model VehicleModel {
  id         String    @id @default(cuid())
  makeId     String
  make       VehicleMake @relation(fields: [makeId], references: [id])
  name       String
  slug       String    @unique
  startYear  Int
  endYear    Int?
  generations VehicleGeneration[]
}

model VehicleApplication {
  id                 String    @id @default(cuid())
  productId          String
  product            Product   @relation(fields: [productId], references: [id])
  modificationId     String
  modification       VehicleModification @relation(fields: [modificationId], references: [id])
  @@unique([productId, modificationId])
}
```

#### 8.1.2 Vehicles endpoints

**Public endpoints**:

- `GET /api/v1/vehicles/makes` - список марок
- `GET /api/v1/vehicles/models?makeId=` - модели марки
- `GET /api/v1/vehicles/search` - поиск автомобиля
- `GET /api/v1/vehicles/[modificationId]/parts` - запчасти для авто

**Admin endpoints**:

- CRUD для марок, моделей, поколений, модификаций
- `POST /api/v1/vehicles/applications` - привязка товаров к авто
- `POST /api/v1/vehicles/import` - импорт из TecDoc

### 8.2 Frontend: Панель управления

#### 8.2.1 Управление автокаталогом

**Структура FSD**:

```
widgets/
├── vehicle-management/
│   ├── ui/
│   │   ├── index.tsx
│   │   └── vehicle-tree.tsx
│   ├── model/
│   │   └── vehicle-tree-store.ts
│   └── lib/
│       └── tree-utils.ts

features/
├── create-vehicle/
├── edit-vehicle/
├── import-vehicles/
└── link-products-to-vehicle/

entities/
├── vehicle/
│   ├── ui/
│   │   ├── vehicle-card.tsx
│   │   └── vehicle-badge.tsx
│   ├── model/
│   │   └── types.ts
│   └── api/
│       └── vehicle-api.ts
```

**Страницы**:

- `app/panel/vehicles/page.tsx` - использует VehicleManagementWidget
- `app/panel/vehicles/makes/[id]/page.tsx` - редактирование марки
- `widgets/vehicle-management` - компонент дерева автомобилей

#### 8.2.2 Применимость товаров

**Функциональность**:

- Вкладка "Применимость" в товаре
- Массовая привязка товаров к автомобилям
- Импорт применимости из Excel

### 8.3 Frontend: Публичная часть

#### 8.3.1 Выбор автомобиля

**Структура FSD**:

```
widgets/
├── vehicle-selector/
│   ├── ui/
│   │   ├── index.tsx
│   │   ├── make-select.tsx        # Select с поиском
│   │   ├── model-select.tsx       # Select с группировкой
│   │   └── generation-select.tsx  # NativeSelect
│   ├── model/
│   │   └── vehicle-selector-store.ts
│   └── lib/
│       └── vehicle-storage.ts

features/
├── save-vehicle/                   # use-local-storage хук
├── clear-vehicle/                  # Button с подтверждением
└── filter-by-vehicle/              # Badge с выбранным авто
```

**Компоненты Mantine**:

- `Select` с `searchable` - выбор марки с поиском
- `Select` с `data` группами - модели по годам
- `Group` - компоновка селектов
- `use-local-storage` - сохранение выбора
- Фильтрация товаров по выбранному авто

#### 8.3.2 Каталог по автомобилям

**Страницы**:

- `app/vehicles/page.tsx` - список марок
- `app/vehicles/[make]/[model]/page.tsx` - запчасти для модели
- SEO оптимизация для автомобильных страниц

**Результат этапа**: Полноценный автомобильный каталог с применимостью товаров

## 9. Этап 7: Поиск и SEO оптимизация (5 дней)

### 9.1 Backend: Search API

#### 9.1.1 Полнотекстовый поиск

**Реализация**:

- PostgreSQL full-text search с весами
- Поиск по: названию, описанию, артикулу, кросс-номерам
- Fuzzy matching для опечаток
- Поисковые подсказки (автокомплит)

#### 9.1.2 Search endpoints

**Endpoints**:

- `GET /api/v1/search/suggest?q=` - поисковые подсказки
- `POST /api/v1/search/products` - расширенный поиск
  - Сохранение истории поиска для анонимных и авторизованных
  - Фиксация кликов по результатам поиска
- `GET /api/v1/search/popular` - популярные запросы
- `GET /api/v1/search/history` - история поиска пользователя

### 9.2 Frontend: Панель управления

#### 9.2.1 SEO настройки

**Функциональность**:

- SEO поля в товарах и категориях
- Генерация sitemap
- Управление редиректами
- robots.txt настройки

### 9.3 Frontend: Публичная часть

#### 9.3.1 Поисковая система

**Структура FSD**:

```
widgets/
├── search-page/
│   ├── ui/
│   │   ├── index.tsx
│   │   ├── search-results.tsx     # Card компоненты
│   │   └── search-stats.tsx       # Text с подсветкой
│   └── model/
│       └── search-page-store.ts

features/
├── search-box/
│   ├── ui/
│   │   ├── index.tsx
│   │   ├── search-input.tsx       # Spotlight или Autocomplete
│   │   └── search-suggestions.tsx # List с подсказками
│   ├── model/
│   │   └── search-store.ts
│   └── api/
│       ├── search-products.ts
│       └── get-suggestions.ts
├── search-filters/
│   └── ui/
│       └── search-refinements.tsx # Chip.Group для фильтров

entities/
├── search/
│   ├── model/
│   │   └── types.ts
│   └── lib/
│       └── search-history.ts
```

**Компоненты Mantine для поиска**:

- `Spotlight` - глобальный поиск с горячими клавишами
- `Autocomplete` - поле поиска с подсказками
- `Highlight` - подсветка найденных слов
- `Chip.Group` - выбор фильтров результатов
- `Skeleton` - загрузка результатов

#### 9.3.2 SEO оптимизация

**Реализация**:

- Динамические meta теги для всех страниц
- Структурированные данные (JSON-LD)
- Canonical URLs
- Open Graph разметка
- Оптимизация скорости загрузки

**Результат этапа**: Умный поиск с автокомплитом, полная SEO оптимизация

## 10. Этап 8: Система скидок и промокодов (5 дней)

### 10.1 Backend: Discounts API

#### 10.1.1 Схема скидок

```prisma
model DiscountRule {
  id              String    @id @default(cuid())
  name            String
  type            DiscountType // PERCENTAGE, FIXED, FREE_SHIPPING
  value           Decimal
  minAmount       Decimal?
  startDate       DateTime?
  endDate         DateTime?
  isActive        Boolean   @default(true)
  promoCodes      PromoCode[]
}

model PromoCode {
  id              String    @id @default(cuid())
  code            String    @unique
  discountRuleId  String
  discountRule    DiscountRule @relation(fields: [discountRuleId], references: [id])
  usageLimit      Int?
  usageCount      Int       @default(0)
}
```

#### 10.1.2 Discount endpoints

**Endpoints**:

- `POST /api/v1/promo/validate` - проверка промокода
- `POST /api/v1/cart/apply-promo` - применение промокода
- Admin CRUD для правил скидок и промокодов

### 10.2 Frontend: Панель управления

#### 10.2.1 Управление скидками

**Структура FSD**:

```
widgets/
├── discount-management/
│   ├── ui/
│   │   ├── index.tsx
│   │   └── discounts-table.tsx
│   └── model/
│       └── discounts-store.ts
├── discount-form/
│   ├── ui/
│   │   ├── index.tsx
│   │   ├── basic-info.tsx
│   │   └── conditions.tsx
│   └── model/
│       └── discount-form-store.ts
├── promo-code-management/
│   └── ui/
│       └── promo-codes-table.tsx

features/
├── create-discount/
├── generate-promo-codes/
└── deactivate-promo/

entities/
├── discount/
│   ├── ui/
│   │   └── discount-badge.tsx
│   └── model/
│       └── types.ts
```

**Страницы**:

- `app/panel/discounts/page.tsx` - использует DiscountManagementWidget
- `app/panel/promo-codes/page.tsx` - использует PromoCodeManagementWidget
- `widgets/discount-form` - форма создания скидки

### 10.3 Frontend: Публичная часть

#### 10.3.1 Применение скидок

**Структура FSD**:

```
features/
├── apply-promo-code/
│   ├── ui/
│   │   └── promo-input.tsx
│   ├── model/
│   │   └── use-promo-code.ts
│   └── api/
│       └── validate-promo.ts

entities/
├── promo-code/
│   ├── ui/
│   │   └── discount-info.tsx
│   └── model/
│       └── types.ts
```

**Компоненты**:

- `features/apply-promo-code/ui/promo-input.tsx` - ввод промокода
- Отображение скидок в корзине
- Информация об экономии

**Результат этапа**: Гибкая система скидок и промокодов

## 11. Этап 9: Чат поддержки (10 дней)

### 11.1 Backend: Chat микросервис

#### 11.1.1 Отдельный сервис на Node.js

**Структура**:

```
chat-service/
├── src/
│   ├── server.ts
│   ├── handlers/         # Socket.io обработчики
│   │   ├── auth.ts
│   │   ├── message.ts
│   │   └── product.ts
│   ├── services/         # Бизнес-логика
│   │   ├── chat.service.ts
│   │   └── notification.service.ts
│   ├── lib/             # Утилиты
│   │   ├── redis.ts
│   │   └── jwt.ts
│   └── types/           # TypeScript типы
└── package.json
```

#### 11.1.2 Socket.io реализация

**Функциональность**:

- WebSocket сервер на отдельном порту
- Аутентификация через JWT
- Redis pub/sub для масштабирования
- Сохранение истории в PostgreSQL

#### 11.1.3 REST API для интеграции

**Endpoints**:

- `GET /api/chats` - список чатов
- `GET /api/chats/[id]/messages` - история сообщений
- `POST /api/chats/[id]/assign` - назначение менеджера

### 11.2 Frontend: Панель управления

#### 11.2.1 Интерфейс менеджера

**Структура FSD**:

```
widgets/
├── manager-chat-list/
│   ├── ui/
│   │   ├── index.tsx
│   │   ├── chat-list.tsx
│   │   └── chat-filters.tsx
│   └── model/
│       └── chats-store.ts
├── manager-chat/
│   ├── ui/
│   │   ├── index.tsx
│   │   ├── chat-messages.tsx
│   │   └── chat-input.tsx
│   └── model/
│       └── active-chat-store.ts

features/
├── send-product-card/
│   ├── ui/
│   │   └── product-picker.tsx
│   └── api/
│       └── send-product.ts
├── assign-chat/
└── close-chat/
```

**Страницы**:

- `app/panel/chats/page.tsx` - использует ManagerChatListWidget
- `widgets/manager-chat` - интерфейс переписки
- `features/send-product-card` - выбор товаров для отправки

### 11.3 Frontend: Публичная часть

#### 11.3.1 Виджет чата

**Структура FSD**:

```
widgets/
├── chat-widget/
│   ├── ui/
│   │   ├── index.tsx
│   │   ├── chat-bubble.tsx       # Affix для плавающего виджета
│   │   ├── chat-window.tsx       # Paper с анимацией
│   │   └── chat-header.tsx       # ActionIcon для закрытия
│   ├── model/
│   │   └── chat-widget-store.ts
│   └── lib/
│       └── socket-client.ts

features/
├── send-message/
│   ├── ui/
│   │   └── message-input.tsx     # Textarea с автоувеличением
│   └── api/
│       └── send-message.ts
├── view-product-card/
│   └── ui/
│       └── product-card-message.tsx # Card с изображением

entities/
├── chat/
│   ├── ui/
│   │   ├── message-list.tsx      # ScrollArea с автоскроллом
│   │   └── message-item.tsx      # Avatar + Text
│   ├── model/
│   │   ├── chat-store.ts
│   │   └── types.ts
│   └── api/
│       └── chat-api.ts
```

**Компоненты Mantine для чата**:

- `Affix` - плавающий виджет чата
- `ScrollArea` - область сообщений с кастомным скроллом
- `Textarea` с `autosize` - ввод сообщений
- `Avatar` - аватары пользователей
- `Indicator` - индикатор новых сообщений
- `Notification` - уведомления о новых сообщениях
- Сохранение истории чата для анонимных пользователей
- Связывание чата с учетной записью при авторизации

**Результат этапа**: Real-time чат поддержки с отправкой товаров, сохранением истории для анонимных пользователей

## 12. Этап 10: Импорт/экспорт и интеграции (7 дней)

### 12.1 Backend: Import/Export API

#### 12.1.1 Импорт товаров

**Функциональность**:

- Парсинг Excel файлов
- Валидация данных
- Batch создание/обновление товаров
- Отчет об ошибках импорта

#### 12.1.2 API endpoints

**Endpoints**:

- `POST /api/v1/admin/import/products` - импорт товаров
- `GET /api/v1/admin/import/[id]/status` - статус импорта
- `GET /api/v1/admin/export/products` - экспорт товаров
- `GET /api/v1/admin/export/orders` - экспорт заказов

### 12.2 Frontend: Панель управления

#### 12.2.1 Интерфейс импорта

**Структура FSD**:

```
widgets/
├── import-wizard/
│   ├── ui/
│   │   ├── index.tsx
│   │   ├── upload-step.tsx       # Dropzone для файлов
│   │   ├── mapping-step.tsx      # Table с Select в ячейках
│   │   ├── preview-step.tsx      # DataTable с превью
│   │   └── progress-step.tsx     # Progress и RingProgress
│   ├── model/
│   │   └── import-store.ts
│   └── lib/
│       └── excel-parser.ts

features/
├── upload-import-file/            # Dropzone с валидацией
├── map-columns/                   # Select для маппинга
└── start-import/                  # Button с LoadingOverlay

entities/
├── import-job/
│   ├── ui/
│   │   └── import-status.tsx     # Timeline для статусов
│   └── model/
│       └── types.ts
```

**Компоненты Mantine для импорта**:

- `Stepper` - пошаговый процесс импорта
- `Dropzone` - загрузка Excel файлов
- `Table` с `Select` - маппинг колонок
- `Progress` - прогресс импорта
- `LoadingOverlay` - блокировка интерфейса
- `Alert` - отображение ошибок
- Предпросмотр данных
- Прогресс импорта

#### 12.2.2 Экспорт данных

**Функциональность**:

- Экспорт с текущими фильтрами
- Выбор полей для экспорта
- Форматы: Excel, CSV

### 12.3 Интеграции

#### 12.3.1 Платежная система

**Реализация заглушки**:

- Эмуляция платежного шлюза
- Webhook для обновления статуса
- Подготовка к реальной интеграции

**Результат этапа**: Массовый импорт/экспорт данных, готовность к внешним интеграциям

## 13. Этап 11: Аналитика и отчеты (5 дней)

### 13.1 Backend: Analytics API

#### 13.1.1 Сбор метрик

**Данные**:

- Просмотры товаров
- Конверсия корзины
- Популярные товары
- Выручка по периодам
- Анализ поведения анонимных пользователей
- Связь анонимных сессий с реальными пользователями
- Путь пользователя от анонимного до покупателя
- История поиска и конверсия поисковых запросов

#### 13.1.2 Analytics endpoints

**Endpoints**:

- `GET /api/v1/admin/analytics/sales` - статистика продаж
- `GET /api/v1/admin/analytics/products` - популярные товары
- `GET /api/v1/admin/analytics/customers` - анализ клиентов
- `GET /api/v1/admin/analytics/conversion` - воронка продаж
- `GET /api/v1/admin/analytics/anonymous` - поведение анонимных пользователей
- `GET /api/v1/admin/analytics/user-journey` - путь от анонимного до покупателя

### 13.2 Frontend: Панель управления

#### 13.2.1 Dashboard с аналитикой

**Структура FSD**:

```
widgets/
├── analytics-dashboard/
│   ├── ui/
│   │   ├── index.tsx
│   │   └── dashboard-layout.tsx   # Grid с респонсивными колонками
│   └── model/
│       └── dashboard-store.ts
├── sales-chart/
│   ├── ui/
│   │   └── index.tsx              # BarChart из @mantine/charts
│   └── model/
│       └── use-sales-data.ts
├── top-products/                   # Table с tabularNums
├── conversion-funnel/              # AreaChart с градиентом
├── customer-stats/                 # StatsGrid компонент
├── anonymous-stats/                # RingProgress для визуализации
└── user-journey-flow/              # Sankey диаграмма

features/
├── export-analytics/               # Button с notifications
├── change-date-range/              # DateRangePicker с пресетами
└── refresh-analytics/              # ActionIcon с Loader

entities/
├── analytics/
│   ├── api/
│   │   └── analytics-api.ts
│   └── model/
│       └── types.ts
```

**Компоненты Mantine для аналитики**:

- `@mantine/charts` - графики и диаграммы
- `DateRangePicker` с пресетами ("Последние 7 дней", "Этот месяц")
- `StatsGrid` - готовые карточки статистики
- `NumberFormatter` - форматирование чисел
- `Table` с `tabularNums` - выравнивание чисел в таблицах

#### 13.2.2 Отчеты

**Страницы**:

- `app/panel/reports/page.tsx` - список отчетов
- Генерация PDF отчетов
- Отправка отчетов по email

### 13.3 Frontend: Интеграция метрик

#### 13.3.1 Яндекс.Метрика

**Интеграция**:

- Отслеживание событий e-commerce
- Цели и конверсии
- Enhanced e-commerce данные

**Результат этапа**: Полноценная аналитика с визуализацией данных, включая анализ поведения анонимных пользователей и их конверсию

## 14. Этап 12: PWA и мобильная оптимизация (5 дней)

### 14.1 PWA функциональность

#### 14.1.1 Service Worker

**Структура FSD**:

```
shared/
├── pwa/
│   ├── service-worker.ts
│   ├── offline.html
│   └── lib/
│       ├── cache-strategies.ts
│       └── background-sync.ts

features/
├── install-pwa/
│   ├── ui/
│   │   └── install-prompt.tsx
│   └── model/
│       └── use-install-prompt.ts
├── enable-notifications/
│   └── ui/
│       └── notification-permission.tsx
```

**Реализация**:

- Кеширование статики и API ответов
- Offline страница
- Background sync для отложенных действий
- Push уведомления (подготовка)

#### 14.1.2 Manifest и установка

**Файлы**:

- `public/manifest.json` - метаданные приложения
- Иконки для всех платформ
- Splash screens

### 14.2 Мобильная оптимизация

#### 14.2.1 Адаптивный дизайн

**Улучшения**:

- Touch-friendly интерфейс
- Swipe жесты для галерей
- Оптимизация для медленных сетей
- Упрощенная мобильная навигация

#### 14.2.2 Performance

**Оптимизации**:

- Lazy loading изображений
- Code splitting по маршрутам
- Оптимизация bundle size
- Critical CSS

**Результат этапа**: Приложение работает как native на мобильных устройствах

## 15. Этап 13: Безопасность и финальная оптимизация (5 дней)

### 15.1 Безопасность

#### 15.1.1 Security headers

**Структура FSD**:

```
shared/
├── security/
│   ├── headers.ts
│   ├── rate-limit.ts
│   └── validators/
│       ├── input-sanitizer.ts
│       └── sql-injection-guard.ts

middleware.ts    # Применение security headers и rate limiting
```

**Настройка**:

- Content Security Policy
- CORS политики
- Rate limiting на все endpoints
- SQL injection защита через Prisma

#### 15.1.2 Аудит безопасности

**Проверки**:

- OWASP Top 10
- Dependency scanning
- Penetration testing
- SSL configuration

### 15.2 Оптимизация производительности

#### 15.2.1 Backend оптимизации

**Улучшения**:

- Database query оптимизация
- Индексы для частых запросов
- Redis кеширование
- CDN для статики

#### 15.2.2 Frontend оптимизации

**Метрики**:

- Lighthouse score > 90
- Core Web Vitals в зеленой зоне
- Bundle size < 200kb initial
- Time to Interactive < 3s

### 15.3 Документация и передача

#### 15.3.1 Техническая документация

**Документы**:

- API документация (Swagger)
- Deployment guide
- Database schema
- Architecture overview

#### 15.3.2 Пользовательская документация

**Материалы**:

- Руководство администратора
- Руководство менеджера
- FAQ для клиентов
- Видео-инструкции

**Результат этапа**: Production-ready приложение с полной документацией

## 16. Фаза 2: Рост и масштабирование

### 16.1 Переход к микросервисам (2-3 месяца)

#### 16.1.1 Выделение сервисов

**Первые кандидаты**:

- Search Service (Elasticsearch)
- Notification Service
- Image Processing Service
- Analytics Service

#### 16.1.2 API Gateway

**Внедрение**:

- Kong или Traefik
- Централизованная аутентификация
- Rate limiting
- API versioning

### 16.2 Расширенные интеграции (1-2 месяца)

#### 16.2.1 Внешние системы

**Интеграции**:

- 1С синхронизация
- Маркетплейсы API
- TecDoc каталог
- Службы доставки

#### 16.2.2 Machine Learning

**Возможности**:

- Рекомендательная система
- Предсказание спроса
- Динамическое ценообразование
- Чат-бот с NLP

### 16.3 Kubernetes и Cloud (2-3 месяца)

#### 16.3.1 Контейнеризация

**Docker images**:

- Multi-stage builds
- Оптимизация размера
- Security scanning

#### 16.3.2 K8s deployment

**Ресурсы**:

- Helm charts
- Auto-scaling
- Service mesh (Istio)
- GitOps (ArgoCD)

## Заключение

### Итоговая структура проекта после всех этапов:

```
auto-parts-store/
├── app/                     # Next.js 15 App Router (только роутинг)
│   ├── (public)/           # Публичные страницы
│   ├── panel/              # Административная панель
│   └── api/                # API Routes
├── widgets/                # Самостоятельные блоки UI
├── features/               # Пользовательские сценарии
├── entities/               # Бизнес-сущности
├── shared/                 # Переиспользуемый код
│   ├── ui/                # UI компоненты
│   ├── lib/               # Утилиты и хелперы
│   ├── api/               # API клиенты
│   └── types/             # TypeScript типы
├── chat-service/           # Микросервис чата
├── prisma/                 # База данных
├── infrastructure/         # DevOps конфигурации
└── docs/                   # Документация
```

### Принципы работы с FSD:

1. **Слои и их назначение**:

   - `shared` - переиспользуемый код без бизнес-логики
   - `entities` - бизнес-сущности (User, Product, Order)
   - `features` - интерактивные пользовательские сценарии
   - `widgets` - композиция features и entities в блоки
   - `app` - только роутинг и провайдеры Next.js

2. **Правила импортов**:

   - Импорты разрешены только сверху вниз
   - widgets → features → entities → shared
   - Нельзя импортировать из app в другие слои

3. **Структура внутри слоя**:

   ```
   feature-name/
   ├── ui/          # React компоненты
   ├── model/       # Стейт и бизнес-логика
   ├── api/         # Работа с API
   └── lib/         # Утилиты feature
   ```

4. **Именование**:

   - features - глагол + существительное (add-to-cart, toggle-favorite)
   - widgets - существительное + widget/page (product-page, cart-widget)
   - entities - существительное в единственном числе (product, user)

5. **Пример использования в Next.js**:

   ```typescript
   // app/products/[slug]/page.tsx
   import { ProductPageWidget } from "@/widgets/product-page"

   export default function ProductPage({
     params,
   }: {
     params: { slug: string }
   }) {
     return <ProductPageWidget slug={params.slug} />
   }
   ```

### Временные оценки:

- **Фаза 1 (MVP)**: 13 этапов × 5-10 дней = 90-100 дней
- **Фаза 2 (Рост)**: 5-8 месяцев
- **Фаза 3 (Enterprise)**: 6-12 месяцев

### Команда:

- **Фаза 1**: 2-3 full-stack разработчика
- **Фаза 2**: + 1 DevOps + 1 backend разработчик
- **Фаза 3**: + 2 специализированных разработчика

### Ключевые преимущества поэтапного подхода:

1. **Быстрые результаты**: После каждого этапа есть работающий функционал
2. **Гибкость**: Можно корректировать приоритеты между этапами
3. **Минимальные риски**: Проблемы выявляются на ранних этапах
4. **Постепенное обучение**: Команда растет вместе с проектом
5. **Ранний запуск**: MVP можно запустить после 6-7 этапов
