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