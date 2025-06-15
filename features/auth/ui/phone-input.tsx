"use client"

import { TextInput } from "@mantine/core"
import { UseFormReturnType } from "@mantine/form"

interface PhoneInputProps {
  form: UseFormReturnType<{ phone: string }>
  disabled?: boolean
}

export function PhoneInput({ form, disabled }: PhoneInputProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value
    
    // Удаляем все нецифровые символы кроме +
    value = value.replace(/[^\d+]/g, '')
    
    // Если нет +7 в начале, добавляем
    if (!value.startsWith('+7') && value.length > 0) {
      if (value.startsWith('7')) {
        value = '+' + value
      } else if (value.startsWith('8')) {
        value = '+7' + value.substring(1)
      } else {
        value = '+7' + value
      }
    }
    
    // Ограничиваем длину
    if (value.length > 12) {
      value = value.substring(0, 12)
    }
    
    form.setFieldValue('phone', value)
  }

  return (
    <TextInput
      label="Номер телефона"
      placeholder="+7 (999) 123-45-67"
      value={form.values.phone}
      onChange={handleChange}
      error={form.errors.phone}
      disabled={disabled}
      size="md"
      required
    />
  )
}