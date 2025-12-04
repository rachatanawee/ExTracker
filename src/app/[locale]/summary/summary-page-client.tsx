'use client'

import { useState } from 'react'
import { SummaryContent } from './summary-content'

export function SummaryPageClient() {
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <SummaryContent key={refreshKey} />
  )
}