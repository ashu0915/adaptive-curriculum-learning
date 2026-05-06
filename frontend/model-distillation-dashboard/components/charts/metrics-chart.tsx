"use client"

import React from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface MetricsChartProps {
  data: Array<{
    step: number
    loss: number
    accuracy?: number
  }>
  title: string
  description?: string
}

export function MetricsChart({ data, title, description }: MetricsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="step"
              type="number"
              stroke="#64748b"
              style={{ fontSize: "12px" }}
            />
            <YAxis stroke="#64748b" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
              }}
              itemStyle={{ color: "#0f172a" }}
              formatter={(value) =>
                typeof value === "number" ? value.toFixed(4) : value
              }
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="loss"
              stroke="#3b82f6"
              dot={false}
              strokeWidth={2}
              isAnimationActive={false}
            />
            {data[0]?.accuracy !== undefined && (
              <Line
                type="monotone"
                dataKey="accuracy"
                stroke="#8b5cf6"
                dot={false}
                strokeWidth={2}
                isAnimationActive={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
