"use client"

import React from "react"
import { motion } from "framer-motion"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card } from "@/components/ui/card"

const FAQS = [
  {
    id: "what",
    question: "What makes ACL Distill Studio different?",
    answer:
      "This platform is built around curriculum-centric distillation and adaptive curriculum learning rather than generic model training. It supervises difficulty, pacing, and student-teacher transfer for research-grade results.",
  },
  {
    id: "why",
    question: "Why use adaptive curriculum pacing?",
    answer:
      "Adaptive pacing helps the student model learn gradually, improving stability and generalization by unlocking harder examples only when the curriculum is ready.",
  },
  {
    id: "supported",
    question: "What pacing strategies are available?",
    answer:
      "Choose from Linear, Root, Geometric, and Exponential Gamma pacing strategies to shape your curriculum pool growth.",
  },
  {
    id: "metrics",
    question: "What metrics can I monitor?",
    answer:
      "You can track total loss, KL divergence, knowledge extraction loss, curriculum pool size, and difficulty shift similar to TensorBoard scalar traces.",
  },
  {
    id: "difficulty",
    question: "How does difficulty shift help research?",
    answer:
      "Difficulty shift analysis reveals how the data distribution evolves as the curriculum progresses from easy to hard, informing model robustness and pacing quality.",
  },
  {
    id: "download",
    question: "Can I export final distilled models?",
    answer:
      "Yes — download the final student model artifact as a .pt file for production deployment or downstream experimentation.",
  },
]

export function FAQSection() {
  return (
    <section className="py-20 px-4 md:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Research FAQ
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            Questions about adaptive curriculum learning and distillation research.
          </p>
        </div>

        {/* FAQs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <Card className="glass">
            <Accordion type="single" collapsible className="w-full">
              {FAQS.map((faq) => (
                <AccordionItem key={faq.id} value={faq.id} className="px-6 py-0">
                  <AccordionTrigger className="text-left font-semibold hover:no-underline py-4">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600 dark:text-slate-400 pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
