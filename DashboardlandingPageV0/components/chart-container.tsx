"\"use client"

import type React from "react"

interface ChartContainerProps {
  children: React.ReactNode
  config: any
  className?: string
}

export function ChartContainer({ children, config, className }: ChartContainerProps) {
  return <div className={className}>{children}</div>
}
