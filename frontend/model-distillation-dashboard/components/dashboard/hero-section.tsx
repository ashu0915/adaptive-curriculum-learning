"use client"

import React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Zap, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

interface HeroSectionProps {
  onStartTraining: () => void
}

export function HeroSection({ onStartTraining }: HeroSectionProps) {
  const router = useRouter()
  return (
    <section className="relative py-20 px-4 md:px-6 lg:px-8 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-500/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-violet-500/20 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge variant="secondary" className="inline-flex gap-2 uppercase tracking-[0.35em] text-xs">
            <Zap className="h-3 w-3" />
            Curriculum-Centric Training
          </Badge>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-4"
        >
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight">
            <span className="gradient-text">Adaptive Curriculum Learning Training Studio</span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Research-grade curriculum-centric model distillation with adaptive pacing, teacher-guided optimization, and progressive difficulty scheduling.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
        >
          <Button
            size="lg"
            onClick={onStartTraining}
            className="gap-2 group"
          >
            Start Training
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button size="lg" variant="outline" onClick={() => router.push("/research") }>
            View Research Docs
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid grid-cols-3 gap-8 pt-16 border-t border-slate-200 dark:border-slate-800"
        >
          <div className="space-y-2">
            <p className="text-3xl font-bold gradient-text">Curriculum</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Difficulty Ranked Samples</p>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold gradient-text">Pacing</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Linear → Gamma</p>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold gradient-text">TensorBoard</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Loss, KL, Pool Size</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
