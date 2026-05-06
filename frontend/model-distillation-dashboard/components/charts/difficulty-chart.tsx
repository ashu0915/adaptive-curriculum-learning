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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TooltipProvider } from "@radix-ui/react-tooltip"

interface DifficultyChartProps {
  data: Array<{ index: number; initial: number; final: number }>
  title?: string
  description?: string
}

export function DifficultyChart({ data, title = "Difficulty Shift", description }: DifficultyChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {description ? <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{description}</p> : null}
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="index" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <TooltipProvider>
            <Tooltip
              contentStyle={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px" }}
              formatter={(value) => typeof value === "number" ? value.toFixed(2) : value}
            />
            </TooltipProvider>
            <Legend />
            <Line type="monotone" dataKey="initial" stroke="#3b82f6" strokeWidth={2} dot={false} name="Initial Difficulty" />
            <Line type="monotone" dataKey="final" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Final Difficulty" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
