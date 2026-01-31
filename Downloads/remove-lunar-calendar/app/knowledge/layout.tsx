import React from "react"
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Knowledge Base - Cơ sở Tri thức Dịch học Đông y | Mai Hoa Tâm Pháp',
  description: 'Khám phá cơ sở dữ liệu tri thức gốc về Dịch học Đông y: Ma trận Bát Quái, Lục Thần, Lục Thân và Hệ thống Hào vị được số hóa từ các văn bản y lý cổ truyền.',
  keywords: 'bát quái, lục thần, lục thân, hào vị, 64 quẻ dịch, knowledge base, tri thức dịch học',
}

export default function KnowledgeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
