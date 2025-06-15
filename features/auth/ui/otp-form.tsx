"use client"

import { useState, useEffect } from "react"
import { PinInput, Text, Group, Button, Stack } from "@mantine/core"

interface OTPFormProps {
  onSubmit: (code: string) => void
  onResend: () => void
  isLoading?: boolean
  phone: string
}

export function OTPForm({ onSubmit, onResend, isLoading, phone }: OTPFormProps) {
  const [code, setCode] = useState("")
  const [timeLeft, setTimeLeft] = useState(60)
  const [canResend, setCanResend] = useState(false)

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [timeLeft])

  const handleResend = () => {
    onResend()
    setTimeLeft(60)
    setCanResend(false)
    setCode("")
  }

  const handleSubmit = () => {
    if (code.length === 6) {
      onSubmit(code)
    }
  }

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '')
    const match = cleaned.match(/^(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})$/)
    if (match) {
      return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}-${match[5]}`
    }
    return phone
  }

  return (
    <Stack>
      <Text size="sm" c="dimmed" ta="center">
        Код отправлен на номер {formatPhone(phone)}
      </Text>

      <PinInput
        length={6}
        value={code}
        onChange={setCode}
        type="number"
        size="lg"
        oneTimeCode
        autoFocus
        disabled={isLoading}
        onComplete={handleSubmit}
      />

      <Group justify="space-between" align="center">
        {canResend ? (
          <Button
            variant="subtle"
            size="sm"
            onClick={handleResend}
            disabled={isLoading}
          >
            Отправить код повторно
          </Button>
        ) : (
          <Text size="sm" c="dimmed">
            Повторная отправка через {timeLeft} сек
          </Text>
        )}
      </Group>

      <Button
        fullWidth
        onClick={handleSubmit}
        disabled={code.length !== 6 || isLoading}
        loading={isLoading}
      >
        Подтвердить
      </Button>
    </Stack>
  )
}