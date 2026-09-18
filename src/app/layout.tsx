import type { Metadata, Viewport } from 'next'
import { site } from '@/content/site'
import './globals.css'

const description = `Public repositories from ${site.name}.`

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.name,
    template: `%s — ${site.name}`,
  },
  description,
  openGraph: {
    type: 'website',
    siteName: site.name,
    title: site.name,
    description,
    url: site.url,
  },
  twitter: {
    card: 'summary',
    title: site.name,
    description,
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Matches the light/dark `--bg` tokens so the browser chrome does not
  // flash a mismatched color on load.
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fbfbfa' },
    { media: '(prefers-color-scheme: dark)', color: '#101010' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
