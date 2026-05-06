"use client"

import React from "react"
import { motion } from "framer-motion"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, Loader } from "lucide-react"

interface TrainingProgressProps {
  jobId: string
  stage: string
  status: "pending" | "training" | "done" | "failed" | "error"
  progress: number
  currentStep: number
  totalSteps: number
  error?: string
}

export function TrainingProgress({
  jobId,
  stage,
  status,
  progress,
  currentStep,
  totalSteps,
  error,
}: TrainingProgressProps) {
  const statusConfig = {
    pending: { icon: Loader, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20", label: "Pending" },
    training: { icon: Loader, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20", label: "Training" },
    done: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/20", label: "Complete" },
    failed: { icon: AlertCircle, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20", label: "Failed" },
    error: { icon: AlertCircle, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20", label: "Error" },
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className={`border-2 ${config.bg}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg">Training Progress</CardTitle>
              <CardDescription>
                Job ID: {jobId.slice(0, 8)}... · Stage: {stage}
              </CardDescription>
            </div>
            <Badge variant="secondary" className="gap-2">
              <Icon className={`h-4 w-4 ${config.color} ${status === "training" ? "animate-spin" : ""}`} />
              {config.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm font-monobold">{progress.toFixed(0)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          {/* Step Counter */}
          <div className="p-4 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Current Step</span>
              <span className="font-mono font-bold text-lg gradient-text">
                {currentStep.toLocaleString()} / {totalSteps.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-200 font-medium">
                Error: {error}
              </p>
            </div>
          )}

          {/* Status Indicators */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Status</p>
              <Badge variant="outline" className="w-full justify-center">
                {config.label}
              </Badge>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">ETA</p>
              <Badge variant="secondary" className="w-full justify-center">
                ~{Math.ceil((totalSteps - currentStep) / 10)}m
              </Badge>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Speed</p>
              <Badge variant="secondary" className="w-full justify-center">
                {(currentStep / (currentStep + 1)).toFixed(1)} steps/s
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
