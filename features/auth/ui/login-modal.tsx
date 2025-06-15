"use client"

import { useState } from "react"
import { Modal, Stack, Text, Button, Group, CloseButton } from "@mantine/core"
import { useForm } from "@mantine/form"
import { notifications } from "@mantine/notifications"
import { PhoneInput } from "./phone-input"
import { OTPForm } from "./otp-form"
import { useAuthStore } from "../model/auth-store"
import { ApiError } from "@/shared/lib/api/client"

interface LoginModalProps {
  opened: boolean
  onClose: () => void
}

type AuthStep = "phone" | "otp"

export function LoginModal({ opened, onClose }: LoginModalProps) {
  const [step, setStep] = useState<AuthStep>("phone")
  const [userId, setUserId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  
  const { sendOTP, verifyOTP } = useAuthStore()

  const phoneForm = useForm({
    initialValues: {
      phone: "",
    },
    validate: {
      phone: (value) => {
        if (!value) return "Введите номер телефона"
        if (!value.match(/^\+7\d{10}$/)) return "Неверный формат телефона"
        return null
      },
    },
  })

  const handleSendOTP = async () => {
    const validation = phoneForm.validate()
    if (validation.hasErrors) return

    setIsLoading(true)
    try {
      const result = await sendOTP(phoneForm.values.phone)
      setUserId(result.userId)
      setStep("otp")
    } catch (error) {
      if (error instanceof ApiError) {
        notifications.show({
          title: "Ошибка",
          message: "Не удалось отправить код подтверждения",
          color: "red",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async (code: string) => {
    setIsLoading(true)
    try {
      // Получаем ID анонимного пользователя из localStorage
      const anonymousId = localStorage.getItem("anonymousId")
      
      await verifyOTP(userId, code, anonymousId || undefined)
      
      notifications.show({
        title: "Успешно",
        message: "Вы успешно авторизовались",
        color: "green",
      })
      
      onClose()
    } catch (error) {
      if (error instanceof ApiError) {
        notifications.show({
          title: "Ошибка",
          message: "Неверный код подтверждения",
          color: "red",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = () => {
    handleSendOTP()
  }

  const handleClose = () => {
    phoneForm.reset()
    setStep("phone")
    setUserId("")
    onClose()
  }

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      withCloseButton={false}
      size="sm"
      centered
    >
      <Stack>
        <Group justify="space-between" align="center" mb="md">
          <Text fw={500} size="lg">
            {step === "phone" ? "Вход или регистрация" : "Подтверждение"}
          </Text>
          <CloseButton onClick={handleClose} />
        </Group>
        
        {step === "phone" ? (
          <>
            <Text size="sm" c="dimmed">
              Введите номер телефона, мы отправим вам код подтверждения
            </Text>
            
            <form onSubmit={(e) => { e.preventDefault(); handleSendOTP() }}>
              <Stack>
                <PhoneInput form={phoneForm} disabled={isLoading} />
                <Button
                  fullWidth
                  type="submit"
                  loading={isLoading}
                  disabled={!phoneForm.values.phone}
                >
                  Получить код
                </Button>
              </Stack>
            </form>
            
            <Text size="xs" c="dimmed" ta="center">
              Нажимая кнопку, вы соглашаетесь с условиями использования
            </Text>
          </>
        ) : (
          <OTPForm
            phone={phoneForm.values.phone}
            onSubmit={handleVerifyOTP}
            onResend={handleResendOTP}
            isLoading={isLoading}
          />
        )}
      </Stack>
    </Modal>
  )
}