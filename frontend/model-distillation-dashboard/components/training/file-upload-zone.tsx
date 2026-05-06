"use client"
import React, { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, X, File, AlertCircle, Folder, Archive } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  const [uploadMode, setUploadMode] = useState<"file" | "folder">("file")

  const validateAndSelectFile = (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      alert(`File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`)
      return
    }

    const validExtensions = [".jsonl", ".csv", ".zip"]
    const fileExt = file.name.substring(file.name.lastIndexOf(".")).toLowerCase()

    if (!validExtensions.includes(fileExt)) {
      alert("Supported formats: .jsonl, .csv, .zip (for folder uploads)")
      return
    }

    onFileSelected(file)
  }

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0]
        validateAndSelectFile(file)
      }
    },
    [onFileSelected]
  )

  const onFolderDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        // Create a ZIP file from the dropped folder
        alert("Folder upload detected. Please prepare a ZIP file containing your CSV/JSONL files.")
      }
    },
    [onFileSelected]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept:
      uploadMode === "file"
        ? {
            "application/jsonl": [".jsonl"],
            "text/csv": [".csv"],
            "application/zip": [".zip"],
          }
        : undefined,
    disabled: isLoading || !!selectedFile,
  })

  const handleFolderUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      // For folder upload, we'll create a virtual "folder" file
      // The backend will handle processing multiple files
      const fileArray = Array.from(files)
      if (fileArray.length > 0) {
        // Create a combined file or zip
        // For now, just use the first file as demo
        validateAndSelectFile(fileArray[0])
      }
    }
  }

  const getFileIcon = (fileName?: string) => {
    if (!fileName) return <Upload className="h-8 w-8" />
    if (fileName.endsWith(".zip")) return <Archive className="h-8 w-8" />
    if (fileName.endsWith(".csv")) return <File className="h-8 w-8" />
    return <File className="h-8 w-8" />
  }

  const getFileTypeLabel = (fileName?: string) => {
    if (!fileName) return "Upload Dataset"
    if (fileName.endsWith(".zip")) return "Folder Upload (ZIP)"
    if (fileName.endsWith(".csv")) return "CSV Dataset"
    return "JSONL Dataset"
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="file" className="w-full" onValueChange={(v) => setUploadMode(v as any)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="file">
            <File className="h-4 w-4 mr-2" />
            Single File
          </TabsTrigger>
          <TabsTrigger value="folder">
            <Folder className="h-4 w-4 mr-2" />
            Folder (ZIP)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="file" className="space-y-4 mt-4">
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
                    Drag & drop or click to select (.jsonl, .csv, or .zip) - max{" "}
                    {MAX_FILE_SIZE / (1024 * 1024)}MB
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <Card className="p-6 border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/20">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded">
                    {getFileIcon(selectedFile.name)}
                  </div>
                  <div>
                    <p className="font-semibold text-green-900 dark:text-green-100">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      {selectedFile.size} bytes • {getFileTypeLabel(selectedFile.name)}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">Ready</Badge>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="folder" className="space-y-4 mt-4">
          {!selectedFile ? (
            <div className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <Archive className="h-8 w-8 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                      Upload Folder as ZIP
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Create a ZIP file containing multiple CSV or JSONL files from your project
                    </p>
                  </div>
                  <Button className="mt-4">
                    <label className="cursor-pointer">
                      Select ZIP File
                      <input
                        type="file"
                        accept=".zip"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            validateAndSelectFile(e.target.files[0])
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </Button>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  The ZIP file will be extracted and all CSV/JSONL files will be merged into a single
                  dataset for training.
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <Card className="p-6 border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/20">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded">
                    <Archive className="h-6 w-6 text-green-600 dark:text-green-400" />
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
                <Badge variant="secondary">Ready</Badge>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Alert variant="default" className="border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/20">
        <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertDescription className="text-blue-900 dark:text-blue-100">
          <div className="space-y-2">
            <p className="font-semibold">Required Format:</p>
            {uploadMode === "file" ? (
              <div className="text-sm space-y-1">
                <p>
                  <strong>JSONL:</strong> Each line must be valid JSON with a
                  <code className="bg-blue-200 dark:bg-blue-800 px-2 py-1 rounded mx-1">"text"</code>
                  field
                </p>
                <p>
                  <strong>CSV:</strong> Must have a column named
                  <code className="bg-blue-200 dark:bg-blue-800 px-2 py-1 rounded mx-1">"text"</code>
                  (or: content, data, sentence, document, description)
                </p>
                <p>
                  <strong>ZIP:</strong> Contains multiple CSV/JSONL files to be merged
                </p>
              </div>
            ) : (
              <p className="text-sm">
                Contains multiple CSV/JSONL files. Each file must have text data that will be merged.
              </p>
            )}
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}
