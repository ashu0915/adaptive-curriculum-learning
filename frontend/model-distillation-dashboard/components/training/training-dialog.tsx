"use client"

import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { FileUploadZone } from "./file-upload-zone"
import { ModelSelector } from "./model-selector"
import { TrainingProgress } from "./training-progress"
import { JobStatus } from "./job-status"
import { DifficultyTable } from "@/components/results/difficulty-table"
import { LossChart } from "@/components/charts/loss-chart"
import { useToast } from "@/components/ui/use-toast"
import { apiClient } from "@/lib/api"
import { ResultsData, MetricsPayload } from "@/lib/types"
import { Upload, Settings, Zap } from "lucide-react"

interface TrainingDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function TrainingDialog({ isOpen, onClose }: TrainingDialogProps) {
  const [activeTab, setActiveTab] = useState("dataset")
  const [selectedFile, setSelectedFile] = useState<File | undefined>()
  const [selectedModel, setSelectedModel] = useState("distilbert")
  const [isTraining, setIsTraining] = useState(false)
  const [jobId, setJobId] = useState<string | null>(null)
  const [trainingStatus, setTrainingStatus] = useState<"pending" | "training" | "done" | "error">("pending")
  const [trainingStage, setTrainingStage] = useState("Waiting for dataset upload")
  const [progress, setProgress] = useState(0)
  const [metrics, setMetrics] = useState<MetricsPayload>({})
  const [results, setResults] = useState<ResultsData | null>(null)
  const { toast } = useToast()

  const parseStep = (value?: number) => (value !== undefined ? Math.min(Math.max(value, 0), 100) : 0)

  const handleStartTraining = async () => {
    if (!selectedFile) {
      toast.error("Please select a dataset file")
      return
    }

    setIsTraining(true)
    setTrainingStatus("training")
    setTrainingStage("Scoring dataset with teacher model")

    try {
      const formData = new FormData()
      formData.append("dataset", selectedFile)
      formData.append("model_name", selectedModel)

      const response = await apiClient.startTraining(formData)
      setJobId(response.job_id)
      setActiveTab("progress")
      toast.success("Training workflow started")

      const pollPromise = apiClient.pollTrainingStatus(
        response.job_id,
        async (status) => {
          const updatedStatus = status.status === "error" ? "error" : status.status
          setTrainingStatus(updatedStatus as any)
          setTrainingStage(
            status.status === "training"
              ? "Adaptive curriculum distillation in progress"
              : status.status === "done"
              ? "Finalizing results"
              : trainingStage
          )

          if (status.progress !== undefined) {
            setProgress(parseStep(status.progress))
          }

          try {
            const newMetrics = await apiClient.getMetrics(response.job_id)
            setMetrics(newMetrics)
          } catch {
            // metrics may not be available yet
          }
        }
      )

      const result = await pollPromise
      if (result.status === "done") {
        setTrainingStatus("done")
        setProgress(100)
        setTrainingStage("Completed")
        const responseResults = await apiClient.getResults(response.job_id)
        setResults(responseResults)
        toast.success("Training completed successfully!")
      } else {
        setTrainingStatus("error")
        setTrainingStage("Training failed")
        toast.error("Training failed: " + (result.error || "Unknown error"))
      }
    } catch (error) {
      setTrainingStatus("error")
      setTrainingStage("Training failed")
      toast.error(error instanceof Error ? error.message : "Failed to start training")
    } finally {
      setIsTraining(false)
    }
  }

  const handleClose = () => {
    if (isTraining && trainingStatus === "training") {
      if (confirm("Training is in progress. Close anyway?")) {
        onClose()
      }
    } else {
      setSelectedFile(undefined)
      setSelectedModel("distilbert")
      setJobId(null)
      setTrainingStatus("pending")
      setTrainingStage("Waiting for dataset upload")
      setProgress(0)
      setMetrics({})
      setResults(null)
      setActiveTab("dataset")
      onClose()
    }
  }

  // Extract loss data from metrics
  const lossData = (metrics["loss/total"] as any[])?.map((item: any) => ({
    step: item.step,
    value: item.value
  })) ?? []

  // Calculate progress based on final step (total steps = 200)
  const maxStep = Math.max(...lossData.map(d => d.step), 0)
  const calculatedProgress = (maxStep / 200) * 100

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Curriculum Distillation Workflow</DialogTitle>
          <DialogDescription>
            Guide your adaptive curriculum distillation experiment with dataset scoring, pacing and live metrics.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dataset" className="gap-2">
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Dataset</span>
            </TabsTrigger>
            <TabsTrigger value="model" disabled={!selectedFile || isTraining} className="gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Model</span>
            </TabsTrigger>
            <TabsTrigger value="progress" disabled={!jobId} className="gap-2">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Training</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dataset" className="space-y-6">
            <FileUploadZone
              onFileSelected={setSelectedFile}
              selectedFile={selectedFile}
              isLoading={isTraining}
            />
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-5">
              <p className="font-semibold">Curriculum Preparation</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                After upload, the backend will compute initial difficulty scores and rank samples from easy to hard before distillation begins.
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={() => setActiveTab("model")} disabled={!selectedFile || isTraining}>
                Next
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="model" className="space-y-6">
            <ModelSelector
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
            />
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setActiveTab("dataset")}>Back</Button>
              <Button onClick={handleStartTraining} disabled={isTraining}>
                {isTraining ? "Starting..." : "Begin Training"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <JobStatus
              jobId={jobId}
              stage={trainingStage}
              status={trainingStatus}
              progress={calculatedProgress}
            />
            {jobId && (
              <TrainingProgress
                jobId={jobId}
                stage={trainingStage}
                status={trainingStatus}
                progress={calculatedProgress}
                currentStep={maxStep}
                totalSteps={200}
                error={trainingStatus === "error" ? "Training process encountered an error" : undefined}
              />
            )}

            {/* Single Loss Chart */}
            {lossData.length > 0 && (
              <LossChart data={lossData} description="Loss over training steps" />
            )}

            {/* Download Section */}
            {trainingStatus === "done" && jobId && (
              <div className="flex justify-center pt-6">
                <a href={`${apiClient.getDownloadUrl(jobId)}`} download>
                  <Button>
                    Download Model
                  </Button>
                </a>
              </div>
            )}

            {/* Final Results Table */}
            {/* {results?.items.length ? (
              <DifficultyTable items={results.items.slice(0, 8)} />
            ) : (
              trainingStatus === "done" && (
                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-6 text-slate-600 dark:text-slate-400">
                  <p className="font-medium">Final difficulty ranking will appear here when the job completes.</p>
                </div>
              )
            )} */}

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={handleClose} disabled={trainingStatus === "training"}>
                {trainingStatus === "training" ? "Training in Progress..." : "Close"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
