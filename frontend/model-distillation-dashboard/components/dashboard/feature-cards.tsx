"use client"

import React from "react"
import { motion } from "framer-motion"
import {
  Zap,
  Lightbulb,
  TrendingUp,
  LineChart,
  Activity,
  Download,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const FEATURES = [
  {
    icon: Zap,
    title: "Adaptive Curriculum Scheduling",
    description: "Progressively unlock easy-to-hard examples with research-grade pacing schedules.",
    badge: "Curriculum",
  },
  {
    icon: Lightbulb,
    title: "Teacher-Guided Distillation",
    description: "Student models learn from teacher signals while difficulty is adaptively regulated.",
    badge: "Guided",
  },
  {
    icon: TrendingUp,
    title: "Dynamic Pool Expansion",
    description: "Linear, root, geometric and exponential gamma pacing tune curriculum growth.",
    badge: "Adaptive",
  },
  {
    icon: LineChart,
    title: "TensorBoard Metrics",
    description: "Live scalar traces for total loss, KL, knowledge extraction and pool size.",
    badge: "Observability",
  },
  {
    icon: Activity,
    title: "Difficulty Shift Analysis",
    description: "Measure how sample difficulty evolves from initial scoring to final ranking.",
    badge: "Analysis",
  },
  {
    icon: Download,
    title: "Download Distilled Models",
    description: "Export student model artifacts in .pt format for production deployment.",
    badge: "Export",
  },
]

export function FeatureCards() {
  return (
    <section className="py-20 px-4 md:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Research-grade capabilities for adaptive distillation
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Designed for curriculum-centric model distillation and adaptive learning experiments.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                viewport={{ once: true }}
              >
                <Card className="group hover:shadow-xl transition-all duration-300 hover:border-indigo-500/40 dark:hover:border-indigo-500/40 h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="p-3 bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30 rounded-lg group-hover:shadow-lg transition-shadow">
                        <Icon className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {feature.badge}
                      </Badge>
                    </div>
                    <CardTitle className="mt-4">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base text-slate-600 dark:text-slate-400">
                      {feature.description}
                    </CardDescription>
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
