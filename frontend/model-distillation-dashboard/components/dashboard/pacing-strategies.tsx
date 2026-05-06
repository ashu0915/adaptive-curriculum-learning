"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Triangle, Sparkles, ArrowRight } from "lucide-react"

const STRATEGIES = [
  {
    label: "Linear",
    pattern: "+1 per step",
    description: "Steady curriculum growth with predictable pacing for stable optimization.",
    icon: BarChart3,
  },
  {
    label: "Root",
    pattern: "√n expansion",
    description: "A cautious ramp-up strategy for smoother difficulty transitions.",
    icon: Triangle,
  },
  {
    label: "Geometric",
    pattern: "×1.5 each stage",
    description: "Accelerated pool growth when the model is confident and ready for harder samples.",
    icon: Sparkles,
  },
  {
    label: "Exponential Gamma",
    pattern: "γ-based growth",
    description: "Advanced pacing with adaptive scaling for research-grade curriculum control.",
    icon: ArrowRight,
  },
]

export function PacingStrategies() {
  return (
    <section className="py-20 px-4 md:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">
            Adaptive Curriculum Pacing
          </p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Choose the pacing strategy that matches your research hypothesis.
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {STRATEGIES.map((strategy, index) => {
            const Icon = strategy.icon
            return (
              <motion.div
                key={strategy.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 transition-all">
                  <CardHeader className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="rounded-2xl bg-indigo-500/10 text-indigo-600 p-3">
                        <Icon className="h-5 w-5" />
                      </div>
                      <Badge variant="secondary">{strategy.pattern}</Badge>
                    </div>
                    <CardTitle>{strategy.label}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-slate-600 dark:text-slate-400">
                    {strategy.description}
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
