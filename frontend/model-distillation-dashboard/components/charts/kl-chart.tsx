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
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TooltipProvider } from "@radix-ui/react-tooltip"

interface KLChartProps {
  data: Array<{ step: number; value: number }>
  title?: string
  description?: string
}

export function KLChart({ data, title = "KL Divergence", description }: KLChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {description ? <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{description}</p> : null}
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="step" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <TooltipProvider>
            <Tooltip
              contentStyle={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px" }}
              formatter={(value) => typeof value === "number" ? value.toFixed(4) : value}
            />
            </TooltipProvider>
            <Line type="monotone" dataKey="value" stroke="#a855f7" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
