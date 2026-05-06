"use client"

import React, { useState } from "react"
import { HeroSection } from "@/components/dashboard/hero-section"
import { FeatureCards } from "@/components/dashboard/feature-cards"
import { FAQSection } from "@/components/dashboard/faq-section"
import { ResearchOverview } from "@/components/dashboard/research-overview"
import { PacingStrategies } from "@/components/dashboard/pacing-strategies"
import { TrainingDialog } from "@/components/training/training-dialog"

export default function Home() {
  const [isTrainingOpen, setIsTrainingOpen] = useState(false)

  return (
    <div className="flex flex-col">
      <HeroSection onStartTraining={() => setIsTrainingOpen(true)} />
      <ResearchOverview />
      <PacingStrategies />
      <FeatureCards />
      <FAQSection />

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-12 px-4 md:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4">ACL Distill Studio</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Research-grade curriculum-centric distillation platform
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-slate-50">Curriculum Flow</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-slate-50">Pacing Strategies</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-slate-50">Research Docs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><a href="/about" className="hover:text-slate-900 dark:hover:text-slate-50">About</a></li>
                <li><a href="/research" className="hover:text-slate-900 dark:hover:text-slate-50">Research</a></li>
                <li><a href="/references" className="hover:text-slate-900 dark:hover:text-slate-50">References</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-slate-50">Contact</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-slate-50">Privacy</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-slate-50">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200 dark:border-slate-800 pt-8 text-center text-sm text-slate-600 dark:text-slate-400">
            <p>&copy; 2026 ACL Distill Studio. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <TrainingDialog isOpen={isTrainingOpen} onClose={() => setIsTrainingOpen(false)} />
    </div>
  )
}
