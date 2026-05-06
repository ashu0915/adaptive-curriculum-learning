"use client"

import { ResearchOverview } from "@/components/dashboard/research-overview"
import { PacingStrategies } from "@/components/dashboard/pacing-strategies"

export default function ResearchPage() {
  return (
    <div className="space-y-12 py-8 px-4 md:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center space-y-4">
        <p className="uppercase tracking-[0.3em] text-sm text-indigo-600 dark:text-indigo-400">Research Overview</p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Curriculum-Centric Distillation Research
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
          Dive into the design of adaptive curriculum learning, pacing strategies, and the teacher-student pipeline that powers ACL Distill Studio.
        </p>
      </div>

      <ResearchOverview />
      <PacingStrategies />
    </div>
  )
}
