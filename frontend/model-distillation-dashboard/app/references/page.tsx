"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const RESEARCH_PAPERS = [
  {
    "title": "Curriculum Learning",
    "authors": "Yoshua Bengio, Jérôme Louradour, Ronan Collobert, and Jason Weston",
    "year": 2009,
    "link": "https://dl.acm.org/doi/10.1145/1553374.1553380"
  },
  {
    "title": "Self-Paced Learning for Latent Variable Models",
    "authors": "M. Pawan Kumar, Benjamin Packer, and Daphne Koller",
    "year": 2010,
    "link": "https://papers.nips.cc/paper/2010/hash/e57c6b956a6521b28495f2886ca0977a-Abstract.html"
  },
  {
    "title": "On the Power of Curriculum Learning in Training Deep Networks",
    "authors": "Guy Hacohen and Daphna Weinshall",
    "year": 2019,
    "link": "https://proceedings.mlr.press/v97/hacohen19a.html"
  },
  {
    "title": "Curriculum Learning by Transfer Learning: Theory and Experiments with Deep Networks",
    "authors": "Daphna Weinshall, Gad Cohen, and Dan Amir",
    "year": 2018,
    "link": "https://proceedings.mlr.press/v80/weinshall18a.html"
  },
  // {
  //   "title": "Adaptive Curriculum Learning",
  //   "authors": "Yunhang Kong, Liu Liu, Jun Wang, and Dacheng Tao",
  //   "year": 2019,
  //   "link": "https://ojs.aaai.org/index.php/AAAI/article/view/3972"
  // },
  {
    "title": "Efficient Pretraining of Masked Language Model via Concept-Based Curriculum Masking",
    "authors": "Minchul Lee, Jae-Ho Park, Jihwan Kim, Kwang-Min Kim, and SangKeun Lee",
    "year": 2022,
    "link": "https://arxiv.org/abs/2212.07617"
  },
  {
    "title": "Curriculum Learning Strategies for IR",
    "authors": "Guilherme Penha and Claudia Hauff",
    "year": 2020,
    "link": "https://link.springer.com/chapter/10.1007/978-3-030-45439-5_46"
  },
  {
    "title": "Curriculum Learning in Reinforcement Learning",
    "authors": "Sanjay Narvekar",
    "year": 2017,
    "link": "https://www.ijcai.org/proceedings/2017/0736.pdf"
  },
  {
    "title": "Rethinking Curriculum Learning with Incremental Labels and Adaptive Compensation",
    "authors": "Madan Ravi Ganesh and Jason J. Corso",
    "year": 2020,
    "link": "https://arxiv.org/abs/2001.04529"
  },
  {
    "title": "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding",
    "authors": "Jacob Devlin, Ming-Wei Chang, Kenton Lee, and Kristina Toutanova",
    "year": 2019,
    "link": "https://aclanthology.org/N19-1423/"
  }
]
const MODEL_REFERENCES = [
  {
    name: "DistilBERT",
    size: "268MB",
    speedup: "2x",
    description: "General-purpose distilled BERT model",
  },
  {
    name: "TinyBERT",
    size: "45MB",
    speedup: "3.5x",
    description: "Ultra-lightweight BERT variant",
  },
  {
    name: "MiniLM",
    size: "84MB",
    speedup: "2.5x",
    description: "Optimized BERT for semantic similarity",
  },
  {
    name: "Custom Models",
    size: "Variable",
    speedup: "Configurable",
    description: "Train your own distilled models",
  },
]

const DOCUMENTATION = [
  {
    title: "Getting Started Guide",
    description: "Quick start guide to begin distilling your first model",
    category: "Beginner",
  },
  {
    title: "API Documentation",
    description: "Comprehensive REST API documentation",
    category: "Developer",
  },
  {
    title: "Advanced Configuration",
    description: "Fine-tune training parameters for your use case",
    category: "Advanced",
  },
  {
    title: "Deployment Best Practices",
    description: "Guide for deploying distilled models in production",
    category: "DevOps",
  },
]

export default function ReferencesPage() {
  return (
    <div className="py-8 px-4 md:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Research & References</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          Curated curriculum learning, distillation, and adaptive learning literature for ACL research.
        </p>
      </div>

      {/* Research Papers */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-4">Research Papers</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Key papers that shaped modern model distillation techniques
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Foundational Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {RESEARCH_PAPERS.map((paper, idx) => (
                <div key={idx} className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-800 last:border-0">
                  <div>
                    <h4 className="font-semibold">{paper.title}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {paper.authors} ({paper.year})
                    </p>
                  </div>
                  <a
                    href={paper.link}
                    className="text-blue-600 dark:text-blue-400 hover:underline text-sm whitespace-nowrap ml-4"
                  >
                    View →
                  </a>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Model References */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-4">Model References</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Available models and their specifications
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Model</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Speedup</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MODEL_REFERENCES.map((model, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-semibold">{model.name}</TableCell>
                    <TableCell>{model.size}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{model.speedup}</Badge>
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">
                      {model.description}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Documentation */}
      {/* <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-4">Documentation</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Comprehensive guides and tutorials
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {DOCUMENTATION.map((doc, idx) => (
            <Card key={idx} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{doc.title}</CardTitle>
                  <Badge variant="outline">{doc.category}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  {doc.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card className="border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/20">
        <CardHeader>
          <CardTitle>Distillation Techniques</CardTitle>
          <CardDescription>Understanding different distillation approaches</CardDescription>
        </CardHeader>
        <CardContent className="space-y-0">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="response-based">
              <AccordionTrigger>Response-Based Distillation</AccordionTrigger>
              <AccordionContent>
                Uses the outputs of the teacher model to train the student. This is the most common approach 
                and works well for classification tasks.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="feature-based">
              <AccordionTrigger>Feature-Based Distillation</AccordionTrigger>
              <AccordionContent>
                Aligns intermediate layer representations between student and teacher models. 
                More computationally intensive but often yields better results.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="relation-based">
              <AccordionTrigger>Relation-Based Distillation</AccordionTrigger>
              <AccordionContent>
                Transfers the structural relationships between data examples. Useful for tasks 
                where model behavior on related inputs matters.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="hybrid">
              <AccordionTrigger>Hybrid Approaches</AccordionTrigger>
              <AccordionContent>
                DistillX combines multiple distillation techniques for optimal results. 
                Our platform automatically selects the best combination for your use case.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card> */}

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {/* <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
              → Full Documentation
            </a> */}
            <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
              → GitHub Repository
            </a>
            {/* <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
              → Community Forum
            </a> */}
            {/* <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
              → Support Center
            </a> */}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
