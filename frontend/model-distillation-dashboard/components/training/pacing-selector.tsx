"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PACING_STRATEGIES } from "@/lib/constants"

interface PacingSelectorProps {
  selectedPacing: string
  onPacingChange: (value: string) => void
}

export function PacingSelector({ selectedPacing, onPacingChange }: PacingSelectorProps) {
  const selectedStrategy = PACING_STRATEGIES.find((strategy) => strategy.value === selectedPacing)

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-semibold mb-3 block">Curriculum Pacing Strategy</Label>
        <Select value={selectedPacing} onValueChange={onPacingChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a pacing strategy" />
          </SelectTrigger>
          <SelectContent>
            {PACING_STRATEGIES.map((strategy) => (
              <SelectItem key={strategy.value} value={strategy.value}>
                {strategy.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Select a pacing schedule to grow the training pool from easy to hard samples.
        </p>
      </div>

      {selectedStrategy && (
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle>{selectedStrategy.label}</CardTitle>
            <CardDescription>{selectedStrategy.pattern}</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-slate-600 dark:text-slate-400">
            {selectedStrategy.description}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
