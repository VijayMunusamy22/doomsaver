function normalizeSiteUrl(rawUrl: string): string {
  const input = rawUrl.trim()
  const withProtocol = /^https?:\/\//i.test(input) ? input : `https://${input}`
  return new URL(withProtocol).origin
}

export function getSiteUrl(): string {
  const candidate =
    process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'

  try {
    return normalizeSiteUrl(candidate)
  } catch {
    return 'http://localhost:3000'
  }
}

export function getAbsoluteUrl(pathname: string): string {
  return new URL(pathname, getSiteUrl()).toString()
}
