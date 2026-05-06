"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Zap } from "lucide-react"
import { MetricsChart } from "@/components/charts/metrics-chart"

interface ResultsPanelProps {
  jobId: string
  metrics: Array<{
    step: number
    loss: number
    accuracy?: number
  }>
  onDownload: () => void
  isLoading?: boolean
}

export function ResultsPanel({
  jobId,
  metrics,
  onDownload,
  isLoading = false,
}: ResultsPanelProps) {
  const finalMetric = metrics[metrics.length - 1]

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Final Loss
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold gradient-text">
              {finalMetric?.loss.toFixed(4) || "N/A"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              After {metrics.length} steps
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Accuracy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {finalMetric?.accuracy ? `${(finalMetric.accuracy * 100).toFixed(1)}%` : "N/A"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Model performance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="success" className="gap-2">
              <Zap className="h-3 w-3" />
              Complete
            </Badge>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Job: {jobId.slice(0, 8)}...
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="metrics" className="space-y-6">
        <TabsList>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics">
          <MetricsChart
            data={metrics}
            title="Training Metrics"
            description="Loss and accuracy over training steps"
          />
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Training Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Job ID</TableCell>
                    <TableCell className="text-right font-mono text-sm">{jobId}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Total Steps</TableCell>
                    <TableCell className="text-right">{metrics.length}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Final Loss</TableCell>
                    <TableCell className="text-right">
                      {finalMetric?.loss.toFixed(4) || "N/A"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Model Size</TableCell>
                    <TableCell className="text-right">45.2 MB</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Inference Speed</TableCell>
                    <TableCell className="text-right">~12ms / sample</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Download Button */}
      <Button
        onClick={onDownload}
        disabled={isLoading}
        size="lg"
        className="w-full gap-2"
      >
        <Download className="h-4 w-4" />
        Download Trained Model
      </Button>
    </div>
  )
}
