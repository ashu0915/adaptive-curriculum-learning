"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrainingDialog } from "@/components/training/training-dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle, AlertCircle, Clock } from "lucide-react"

interface TrainingJob {
  id: string
  model: string
  pacing: string
  status: "completed" | "failed" | "pending"
  createdAt: string
  loss?: number
}

export default function TrainPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [jobs] = useState<TrainingJob[]>([
    {
      id: "job-001",
      model: "DistilBERT",
      pacing: "Linear",
      status: "completed",
      createdAt: "2026-04-25",
      loss: 0.1234,
    },
    {
      id: "job-002",
      model: "MiniLM",
      pacing: "Geometric",
      status: "completed",
      createdAt: "2026-04-24",
      loss: 0.0987,
    },
    {
      id: "job-003",
      model: "TinyBERT",
      pacing: "Exponential Gamma",
      status: "failed",
      createdAt: "2026-04-23",
    },
  ])

  const statusConfig = {
    completed: { icon: CheckCircle, color: "text-green-600", label: "Completed" },
    failed: { icon: AlertCircle, color: "text-red-600", label: "Failed" },
    pending: { icon: Clock, color: "text-blue-600", label: "Pending" },
  }

  return (
    <div className="py-8 px-4 md:px-6 lg:px-8 space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Train ACL Models</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 max-w-2xl">
            Launch adaptive curriculum training jobs, monitor TensorBoard-style metrics, and download distilled student artifacts.
          </p>
        </div>
      </div>
        <Card>
            <CardHeader>
                <CardTitle>
                Ready to start your ACL training?
                </CardTitle>
                <CardDescription>
                Click the button below to configure your training job and monitor progress in real-time.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button size="lg" onClick={() => setIsDialogOpen(true)} className="w-full border-indigo-600 bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer">
                Start ACL Training
                </Button>
            </CardContent>
        </Card>
      {/* <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Total Experiments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{jobs.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-emerald-600">
              {Math.round((jobs.filter((j) => j.status === "completed").length / jobs.length) * 100)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Active Pacing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-indigo-600">Exponential Gamma</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Research-driven scheduling</p>
          </CardContent>
        </Card>
      </div> */}

      {/* <Card>
        <CardHeader>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <CardTitle>Experiment History</CardTitle>
              <CardDescription>Review past ACL jobs and pacing outcomes</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job ID</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Pacing</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Loss</TableHead>
                  <TableHead className="text-right">Started</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => {
                  const config = statusConfig[job.status]
                  const Icon = config.icon
                  return (
                    <TableRow key={job.id}>
                      <TableCell className="font-mono text-sm">{job.id}</TableCell>
                      <TableCell>{job.model}</TableCell>
                      <TableCell>{job.pacing}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="gap-2">
                          <Icon className={`h-3 w-3 ${config.color}`} />
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono">
                        {job.loss ? job.loss.toFixed(4) : "-"}
                      </TableCell>
                      <TableCell className="text-right">{job.createdAt}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card> */}

      <Card className="border-indigo-200 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-900/20">
        <CardHeader>
          <CardTitle>Research Workflow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-slate-600 dark:text-slate-300">
          <p>
            ACL Distill Studio emphasizes a research pipeline that begins with sample difficulty scoring, moves through curriculum reordering, and finishes with adaptive student distillation.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm">
            <li>Upload your dataset and compute initial difficulty with a teacher model.</li>
            <li>Choose a pacing strategy that controls curriculum pool growth.</li>
            <li>Track total loss, KL loss, knowledge extraction, and pool size live.</li>
            <li>Download the distilled student model artifact (.pt) after completion.</li>
          </ul>
        </CardContent>
      </Card>

      <TrainingDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
    </div>
  )
}
