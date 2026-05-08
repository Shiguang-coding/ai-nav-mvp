export async function fetchWebsiteIcon(url: string): Promise<string> {
  try {
    return `https://favicon.im/${extractDomain(url)}`
  } catch {
    return '/default-icon.png'
  }
}

export function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}
