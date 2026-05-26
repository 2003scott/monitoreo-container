import { config } from "dotenv"

config()

export const env = {
    PORT: process.env.PORT || 3000,
    SMTP_SERVICE: process.env.SMTP_SERVICE || '',
    SMTP_HOST: process.env.SMTP_HOST || '',
    SMTP_PORT: Number(process.env.SMTP_PORT || 465),
    SMTP_SECURE: process.env.SMTP_SECURE === 'true',
    SMTP_USER: process.env.SMTP_USER || '',
    SMTP_PASS: process.env.SMTP_PASS || '',
    SMTP_FROM: process.env.SMTP_FROM || '',
    ALERT_EMAIL_TO: process.env.ALERT_EMAIL_TO || '',
}