import { prisma } from '@/shared/lib/db/prisma'

// Транслитерация русских символов
const translitMap: Record<string, string> = {
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
  'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
  'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
  'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '',
  'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
  'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'E',
  'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M',
  'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
  'Ф': 'F', 'Х': 'H', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sch', 'Ъ': '',
  'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya'
}

// Функция транслитерации
export function transliterate(text: string): string {
  return text
    .split('')
    .map(char => translitMap[char] || char)
    .join('')
}

// Генерация базового slug
export function generateSlug(text: string): string {
  return transliterate(text)
    .toLowerCase()
    .trim()
    // Заменяем пробелы и другие символы на дефис
    .replace(/[\s\W-]+/g, '-')
    // Удаляем дефисы в начале и конце
    .replace(/^-+|-+$/g, '')
}

// Генерация уникального slug для категории
export async function generateUniqueSlugForCategory(
  name: string,
  excludeId?: string
): Promise<string> {
  const baseSlug = generateSlug(name)
  let slug = baseSlug
  let counter = 1

  while (true) {
    const existing = await prisma.category.findFirst({
      where: {
        slug,
        ...(excludeId && { id: { not: excludeId } }),
      },
    })

    if (!existing) {
      break
    }

    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}

// Генерация уникального slug для товара
export async function generateUniqueSlugForProduct(
  name: string,
  sku: string,
  excludeId?: string
): Promise<string> {
  // Для товаров добавляем артикул в конец для уникальности
  const baseSlug = generateSlug(`${name}-${sku}`)
  let slug = baseSlug
  let counter = 1

  while (true) {
    const existing = await prisma.product.findFirst({
      where: {
        slug,
        ...(excludeId && { id: { not: excludeId } }),
      },
    })

    if (!existing) {
      break
    }

    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}

// Генерация уникального slug для бренда
export async function generateUniqueSlugForBrand(
  name: string,
  excludeId?: string
): Promise<string> {
  const baseSlug = generateSlug(name)
  let slug = baseSlug
  let counter = 1

  while (true) {
    const existing = await prisma.brand.findFirst({
      where: {
        slug,
        ...(excludeId && { id: { not: excludeId } }),
      },
    })

    if (!existing) {
      break
    }

    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}