"use client"

import React, { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, X, File, AlertCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { MAX_FILE_SIZE } from "@/lib/constants"

interface FileUploadZoneProps {
  onFileSelected: (file: File) => void
  selectedFile?: File
  isLoading?: boolean
}

export function FileUploadZone({
  onFileSelected,
  selectedFile,
  isLoading = false,
}: FileUploadZoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0]
        if (file.size > MAX_FILE_SIZE) {
          alert(`File size must be less than ${MAX_FILE_SIZE}`)
          return
        }
        if (!file.name.endsWith(".jsonl")) {
          alert("Only .jsonl files are supported")
          return
        }
        onFileSelected(file)
      }
    },
    [onFileSelected]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/jsonl": [".jsonl"] },
    disabled: isLoading || !!selectedFile,
  })

  return (
    <div className="space-y-4">
      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={cn(
            "relative border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all",
            isDragActive
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
              : "border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600"
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <Upload className="h-8 w-8 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                {isDragActive ? "Drop here" : "Upload your ACL dataset"}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Select a .jsonl curriculum dataset for difficulty scoring and teacher evaluation (max {MAX_FILE_SIZE} bytes)
              </p>
            </div>
          </div>
        </div>
      ) : (
        <Card className="p-6 border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/20">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded">
                <File className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-semibold text-green-900 dark:text-green-100">
                  {selectedFile.name}
                </p>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  {selectedFile.size} bytes
                </p>
              </div>
            </div>
            <Badge variant="success">Ready</Badge>
          </div>
        </Card>
      )}

      <Alert variant="default">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Upload a JSONL dataset with text examples. The backend computes difficulty scores and ranks your curriculum from easy to hard.
        </AlertDescription>
      </Alert>
    </div>
  )
}
