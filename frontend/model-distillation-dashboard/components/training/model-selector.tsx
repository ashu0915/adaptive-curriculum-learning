"use client"

import React, { useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MODEL_OPTIONS, DEFAULT_TRAINING_CONFIG } from "@/lib/constants"

interface ModelSelectorProps {
  selectedModel: string
  onModelChange: (model: string) => void
}

export function ModelSelector({
  selectedModel,
  onModelChange,
}: ModelSelectorProps) {
  const [steps, setSteps] = useState(DEFAULT_TRAINING_CONFIG.steps)
  const [batchSize, setBatchSize] = useState(DEFAULT_TRAINING_CONFIG.batch_size)
  return (
    <div className="space-y-6">
      {/* Model Selection */}
      <div>
        <Label className="text-base font-semibold mb-3 block">Student Model</Label>
        <Select value={selectedModel} onValueChange={onModelChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a model..." />
          </SelectTrigger>
          <SelectContent>
            {MODEL_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
          Choose a student model; the teacher model will guide curriculum scoring and knowledge extraction.
        </p>
      </div>

      {/* Training Configuration */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg">Training Configuration</CardTitle>
          <CardDescription>Default settings for {selectedModel || "your model"}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Steps</Label>
              <Input
                type="number"
                value={steps}
                onChange={(e) => setSteps(Number(e.target.value))}
                min="1"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Batch Size</Label>
              <Input
                type="number"
                value={batchSize}
                onChange={(e) => setBatchSize(Number(e.target.value))}
                min="1"
                className="w-full"
              />
            </div>
          </div>

          {/* <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Teacher Distillation</Label>
              <span className="inline-flex h-6 w-10 items-center rounded-full bg-green-500">
                <span className="inline-block h-5 w-5 transform rounded-full bg-white translate-x-0.5" />
              </span>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">Lambda KLD</Label>
              <p className="font-mono font-semibold text-sm">
                {DEFAULT_TRAINING_CONFIG.lambda_kld}
              </p>
            </div>
          </div> */}
        </CardContent>
      </Card>
    </div>
  )
}
