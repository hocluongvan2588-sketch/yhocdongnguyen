import React from "react"
import type { Metadata } from 'next'

import { Analytics } from '@vercel/analytics/next'
import './globals.css'

import { Geist_Mono, Manrope as V0_Font_Manrope, Geist_Mono as V0_Font_Geist_Mono, Cormorant as V0_Font_Cormorant } from 'next/font/google'

// Initialize fonts
const _manrope = V0_Font_Manrope({ subsets: ['latin'], weight: ["200","300","400","500","600","700","800"] })
const _geistMono = V0_Font_Geist_Mono({ subsets: ['latin'], weight: ["100","200","300","400","500","600","700","800","900"] })
const _cormorant = V0_Font_Cormorant({ subsets: ['latin'], weight: ["300","400","500","600","700"] })

export const metadata: Metadata = {
  title: 'Mai Hoa Tâm Pháp - Nền tảng Tham vấn Sức khỏe Dịch học Đông y',
  description: 'Hệ thống tham vấn sức khỏe dựa trên Dịch học cổ truyền, kết hợp tri thức Bát Quái và Ngũ Hành để chẩn đoán và tư vấn sức khỏe toàn diện',
  keywords: 'dịch học, đông y, bát quái, ngũ hành, y học cổ truyền, tham vấn sức khỏe, mai hoa tâm pháp',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
