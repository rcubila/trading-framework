"use client"

import { useEffect, useState } from "react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts"

interface AnimatedChartProps {
  data: any[]
  type: "area" | "line" | "bar"
  dataKey: string
  xAxisKey: string
  height?: number
  color?: string
  gradientFrom?: string
  gradientTo?: string
  yAxisFormatter?: (value: number) => string
  animationDuration?: number
}

export function AnimatedChart({
  data,
  type,
  dataKey,
  xAxisKey,
  height = 300,
  color = "#3b82f6",
  gradientFrom = "#3b82f6",
  gradientTo = "#3b82f6",
  yAxisFormatter = (value) => `${value}`,
  animationDuration = 1500,
}: AnimatedChartProps) {
  const [displayData, setDisplayData] = useState<any[]>([])
  const [isAnimating, setIsAnimating] = useState(true)

  useEffect(() => {
    // Reset animation when data changes
    setDisplayData([])
    setIsAnimating(true)

    // Animate data points one by one
    const animateData = async () => {
      const newData = [...data]
      const tempData: any[] = []

      for (let i = 0; i < newData.length; i++) {
        tempData.push(newData[i])
        setDisplayData([...tempData])
        await new Promise((resolve) => setTimeout(resolve, animationDuration / newData.length))
      }

      setIsAnimating(false)
    }

    animateData()
  }, [data, animationDuration])

  const renderChart = () => {
    const gradientId = `color${dataKey}`

    switch (type) {
      case "area":
        return (
          <AreaChart data={displayData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={gradientFrom} stopOpacity={0.8} />
                <stop offset="95%" stopColor={gradientTo} stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id={`stroke${dataKey}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={gradientFrom} />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor={gradientTo} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
            <XAxis
              dataKey={xAxisKey}
              className="text-xs fill-slate-600 dark:fill-slate-400"
              tick={{ fontSize: 12 }}
              stroke="#64748b"
            />
            <YAxis
              className="text-xs fill-slate-600 dark:fill-slate-400"
              tick={{ fontSize: 12 }}
              tickFormatter={yAxisFormatter}
              stroke="#64748b"
            />
            <ChartTooltip
              content={<ChartTooltipContent />}
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                border: "none",
                borderRadius: "12px",
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
              }}
            />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={`url(#stroke${dataKey})`}
              strokeWidth={4}
              fillOpacity={1}
              fill={`url(#${gradientId})`}
              isAnimationActive={isAnimating}
              animationDuration={animationDuration}
              animationEasing="ease-in-out"
            />
          </AreaChart>
        )
      case "line":
        return (
          <LineChart data={displayData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <defs>
              <linearGradient id={`stroke${dataKey}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={gradientFrom} />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor={gradientTo} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
            <XAxis
              dataKey={xAxisKey}
              className="text-xs fill-slate-600 dark:fill-slate-400"
              tick={{ fontSize: 12 }}
              stroke="#64748b"
            />
            <YAxis
              className="text-xs fill-slate-600 dark:fill-slate-400"
              tick={{ fontSize: 12 }}
              tickFormatter={yAxisFormatter}
              stroke="#64748b"
            />
            <ChartTooltip
              content={<ChartTooltipContent />}
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                border: "none",
                borderRadius: "12px",
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
              }}
            />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={`url(#stroke${dataKey})`}
              strokeWidth={4}
              dot={{ fill: color, strokeWidth: 3, r: 6 }}
              activeDot={{ r: 8, fill: color, stroke: "#fff", strokeWidth: 2 }}
              isAnimationActive={isAnimating}
              animationDuration={animationDuration}
              animationEasing="ease-in-out"
            />
          </LineChart>
        )
      case "bar":
        return (
          <BarChart data={displayData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={gradientFrom} />
                <stop offset="100%" stopColor={gradientTo} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
            <XAxis
              dataKey={xAxisKey}
              className="text-xs fill-slate-600 dark:fill-slate-400"
              tick={{ fontSize: 12 }}
              stroke="#64748b"
            />
            <YAxis
              className="text-xs fill-slate-600 dark:fill-slate-400"
              tick={{ fontSize: 12 }}
              tickFormatter={yAxisFormatter}
              stroke="#64748b"
            />
            <ChartTooltip
              content={<ChartTooltipContent />}
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                border: "none",
                borderRadius: "12px",
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
              }}
            />
            <Bar
              dataKey={dataKey}
              fill={`url(#${gradientId})`}
              radius={[6, 6, 0, 0]}
              isAnimationActive={isAnimating}
              animationDuration={animationDuration}
              animationEasing="ease-in-out"
            />
          </BarChart>
        )
      default:
        return null
    }
  }

  return (
    <ChartContainer
      config={{
        [dataKey]: {
          label: dataKey,
          color: color,
        },
      }}
      className={`h-[${height}px] w-full`}
    >
      <ResponsiveContainer width="100%" height="100%">
        {renderChart()}
      </ResponsiveContainer>
    </ChartContainer>
  )
}
