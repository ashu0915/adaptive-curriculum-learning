"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Layers, Cpu, Activity, Gauge, BookOpen } from "lucide-react"

const PIPELINE_STEPS = [
  {
    title: "Dataset Scoring",
    description: "Teacher-guided difficulty scoring transforms raw samples into curriculum-ready examples.",
    icon: BookOpen,
  },
  {
    title: "Difficulty Ranking",
    description: "Reorder data from easy to hard to create a curriculum-centric training schedule.",
    icon: Layers,
  },
  {
    title: "Adaptive Pacing",
    description: "Grow the curriculum pool with linear, root, geometric and exponential gamma pacing.",
    icon: Gauge,
  },
  {
    title: "Student Distillation",
    description: "Teacher supervises and the student learns progressively for robust compressed models.",
    icon: Cpu,
  },
  {
    title: "TensorBoard Metrics",
    description: "Track loss, KL, knowledge extraction, pool size and difficulty shift in real time.",
    icon: Activity,
  },
]

export function ResearchOverview() {
  return (
    <section className="py-20 px-4 md:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <Badge variant="secondary" className="uppercase tracking-[0.2em] text-xs">
            Curriculum-Centric Distillation
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Research first. Curriculum-first. Results-first.
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            ACL Distill Studio is built around adaptive curriculum learning and curriculum-centric model distillation, delivering a research-grade workflow for difficulty-aware training and progressive student optimization.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {PIPELINE_STEPS.map((step, index) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                viewport={{ once: true }}
              >
                <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur">
                  <CardHeader className="space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 p-3 text-white shadow-lg shadow-violet-500/10">
                        <Icon className="h-5 w-5" />
                      </div>
                      <Badge variant="outline">Step {index + 1}</Badge>
                    </div>
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-slate-600 dark:text-slate-400">
                    {step.description}
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        <div className="flex items-center justify-center pt-4">
          <ArrowRight className="h-5 w-5 text-indigo-500" />
          <span className="ml-3 text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
            From dataset scoring to final distilled model
          </span>
        </div>
      </div>
    </section>
  )
}
