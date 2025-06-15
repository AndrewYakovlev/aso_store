import { config } from '@/env'

interface SMSResult {
  success: boolean
  messageId?: string
  error?: string
}

export async function sendSMS(phone: string, message: string): Promise<SMSResult> {
  // В разработке просто логируем
  if (process.env.NODE_ENV === 'development') {
    console.log(`[SMS] Отправка на ${phone}: ${message}`)
    return { success: true, messageId: 'dev-' + Date.now() }
  }

  // В продакшене используем SMS.ru API
  if (!config.sms.apiKey) {
    return { success: false, error: 'SMS API key not configured' }
  }

  try {
    const params = new URLSearchParams({
      api_id: config.sms.apiKey,
      to: phone,
      msg: message,
      json: '1',
    })

    const response = await fetch(`https://sms.ru/sms/send?${params}`)
    const data = await response.json()

    if (data.status === 'OK') {
      return { success: true, messageId: data.sms[phone].sms_id }
    } else {
      return { success: false, error: data.status_text }
    }
  } catch (error) {
    return { success: false, error: 'SMS service error' }
  }
}

export async function sendOTPSMS(phone: string, code: string): Promise<SMSResult> {
  const message = `Ваш код подтверждения: ${code}. Код действителен 10 минут.`
  return sendSMS(phone, message)
}