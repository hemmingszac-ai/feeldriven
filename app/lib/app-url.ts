const LOCAL_APP_URL = 'http://localhost:3000'
const PRODUCTION_APP_URL = 'https://feeldriven.vercel.app'

export function getAppUrl() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL ?? ''

  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, '')
  }

  if (process.env.VERCEL_ENV === 'preview' && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  return process.env.NODE_ENV === 'production'
    ? PRODUCTION_APP_URL
    : LOCAL_APP_URL
}
