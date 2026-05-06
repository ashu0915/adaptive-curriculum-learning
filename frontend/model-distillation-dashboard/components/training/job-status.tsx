"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, ShieldCheck, AlertTriangle, Clock } from "lucide-react"

interface JobStatusProps {
  jobId: string | null
  stage: string
  status: "pending" | "training" | "done" | "error"
  progress: number
}

export function JobStatus({ jobId, stage, status, progress }: JobStatusProps) {
  const statusMap = {
    pending: { label: "Scoring Dataset", color: "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100", icon: Clock },
    training: { label: "Distilling", color: "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100", icon: Activity },
    done: { label: "Completed", color: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100", icon: ShieldCheck },
    error: { label: "Error", color: "bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100", icon: AlertTriangle },
  } as const

  const current = statusMap[status]
  const Icon = current.icon

  return (
    <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg">Job Status</CardTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400">Stage: {stage}</p>
          </div>
          <Badge className={`${current.color} px-3 py-1 rounded-full`}>
            <Icon className="h-4 w-4 mr-1" />
            {current.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Job</p>
          <p className="font-mono mt-1">{jobId ? jobId.slice(0, 8) + "..." : "—"}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Progress</p>
          <p className="font-semibold mt-1">{Math.round(progress)}%</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Curriculum</p>
          <p className="font-semibold mt-1">{status === "training" ? "Growing" : "Ready"}</p>
        </div>
      </CardContent>
    </Card>
  )
}
