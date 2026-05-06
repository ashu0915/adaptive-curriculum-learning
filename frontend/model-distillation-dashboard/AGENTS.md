Project Overview

Build a high-end, enterprise-grade, production-quality frontend for our Adaptive Curriculum Learning + Curriculum-Centric Model Distillation research platform called:

ACL Distill Studio
(Adaptive Curriculum Learning Distillation Studio)
Core Research Identity (VERY IMPORTANT)

This is not a generic model training dashboard.

This platform demonstrates an advanced AI/ML research system implementing:

Our Actual Research Focus:
Curriculum-Centric Distillation + Adaptive Curriculum Learning (CCM + ACL)

The platform enables users to:

Primary Workflow:
Upload custom .jsonl dataset
Automatically compute initial sample difficulty scores
Use a teacher model to evaluate dataset complexity
Rank and reorder data from easy → hard
Select compatible student model
Start adaptive curriculum-based distillation training
Dynamically increase training pool size using pacing strategies:
Linear
Root
Geometric
Exponential Gamma
Monitor:
Loss Total
KL Divergence Loss
Knowledge Extraction Loss
Curriculum Pool Growth
Difficulty Progression
Visualize curriculum progression over time
Show TensorBoard-equivalent metrics directly in UI
Show dataset difficulty shift:
Initial Difficulty
Final Difficulty
Display final ranked results
Download distilled student model artifact (.pt)
Research Differentiator (Must Be Reflected in UI)

Unlike normal ML dashboards, this system is centered around:

Key Innovation:
“Curriculum-Centric Model Distillation”

A framework where:

Teacher supervises
Student learns progressively
Dataset complexity is adaptively controlled
Harder samples unlock gradually
Distillation quality improves through pacing
Frontend Must Communicate:
This is a research-grade ACL framework, not just “upload and train”.
Visual Style
Premium Design Direction:
“Research + Enterprise ML Ops Console”

Should feel like:

HuggingFace AutoTrain
Weights & Biases
AWS SageMaker
Datadog
Vercel
TensorBoard + SaaS hybrid
Aesthetic Requirements:
Must NOT look like:
College project
Basic file uploader
Simple dashboard
CRUD admin panel
Must Feel Like:
AI Research Product
Distillation Observatory
Experimental ML Control Center
Tech Stack Requirements

Use:

Next.js (App Router)
TypeScript
Tailwind CSS
shadcn/ui
Lucide React
Framer Motion
Axios
Recharts
react-dropzone
next-themes
Folder Structure
app/
  layout.tsx
  page.tsx
  globals.css
  about/page.tsx
  references/page.tsx

components/
  ui/
  sidebar/app-sidebar.tsx
  header/app-header.tsx

  dashboard/hero-section.tsx
  dashboard/research-overview.tsx
  dashboard/feature-cards.tsx
  dashboard/pacing-strategies.tsx
  dashboard/faq-section.tsx

  training/training-dialog.tsx
  training/file-upload-zone.tsx
  training/model-selector.tsx
  training/pacing-selector.tsx
  training/training-progress.tsx
  training/job-status.tsx

  charts/loss-chart.tsx
  charts/kl-chart.tsx
  charts/pool-chart.tsx
  charts/difficulty-chart.tsx

  results/results-panel.tsx
  results/difficulty-table.tsx

  theme/theme-toggle.tsx

lib/
  api.ts
  constants.ts
  types.ts
  utils.ts
Backend API Contract (Reflect Current Project)
Base:
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
POST /train
FormData:
dataset
model_name
pacing_strategy
Returns:
{
  "job_id": "uuid"
}
GET /status/{job_id}
{
  "status": "training" | "done" | "error"
}
GET /metrics/{job_id}

Must parse TensorBoard scalar tags:

Current Tags:
loss/total
loss/kl
loss/ke
curriculum/pool_size
Example:
{
  "loss/total": [[1, 12.1], [2, 11.9]],
  "loss/kl": [[1, 0.3]],
  "loss/ke": [[1, 11.8]],
  "curriculum/pool_size": [[1, 1], [2, 2]]
}
GET /results/{job_id}

Returns:

{
  "items": [
    {
      "id": "1",
      "text": "...",
      "initial_difficulty": 3.2,
      "difficulty_score": 2.4
    }
  ]
}
GET /download/{job_id}

Downloads final .pt student model.

Global Layout Requirements
Sidebar (Collapsible)
Use:
SidebarProvider
Sidebar
SidebarMenu
SidebarMenuButton
Sheet
Tooltip
Links:
Home
Train ACL Model
Research Overview
About Team
References
Header
Includes:
Sidebar trigger
Breadcrumb
Search
Notifications
Theme toggle
Profile menu
Theme System
Light:
White / Slate
Indigo / Purple
Research SaaS aesthetic
Dark:
Deep Graphite
Neon Blue / Purple
Glassmorphism
Terminal-lab feel

Theme toggle must:

Sun ☀️ / Moon 🌙
Home Page
Hero Section:
Title:
Adaptive Curriculum Learning Distillation Studio
Subtitle:

“Research-grade curriculum-centric model distillation with adaptive pacing, teacher-guided optimization, and progressive difficulty scheduling.”

CTA:
Start Training
View Research Docs
Research Overview Section

Show:

Pipeline:

Dataset → Teacher Scoring → Difficulty Ranking → Curriculum Pacing → Student Distillation → Metrics → Final Model

Feature Cards
Cards:
Adaptive Curriculum Scheduling
Teacher-Guided Distillation
Dynamic Pool Expansion
TensorBoard Metrics Visualization
Difficulty Shift Analysis
Downloadable Distilled Models
Pacing Strategy Section

Explain:

Linear
Root
Geometric
Exp Gamma
Training Experience (Most Important)
Dialog Tabs:
Tab 1:

Dataset Upload

Tab 2:

Model Config

Models:
DistilBERT
TinyBERT
MiniLM
Config Display:
Steps
Batch
Lambda KLD
Teacher Enabled
Tab 3:

Curriculum Strategy

Linear
Root
Geometric
Exp Gamma
Tab 4:

Live Training

Live Metrics Dashboard
Charts:
Chart 1:

Loss Total vs Step

Chart 2:

KL Loss vs Step

Chart 3:

Knowledge Extraction Loss vs Step

Chart 4:

Curriculum Pool Size vs Step

Chart 5:

Difficulty Shift:
Initial Difficulty vs Final Difficulty

Results Panel
Sections:
Final Metrics
Difficulty Ranking Table
Hardest vs Easiest Samples
Download Model
About Team Page

Include:

Smart academic presentation
Research mission
ACL innovation
Curriculum-centric design philosophy
References Page
Sections:
Curriculum Learning Papers
Knowledge Distillation Papers
TensorBoard References
Adaptive Learning Papers
Internal CCM Framework
UI Requirements

Must Include:

Skeleton loaders
Toasts
Empty states
Error boundaries
Smooth animations
Live pulse indicators
Job ID tracker
Status badges:
Scoring Dataset
Computing Difficulty
Distilling
Completed
API Utility Requirements
lib/api.ts:

Functions:

startTraining()
getTrainingStatus()
getMetrics()
getResults()
getDownloadUrl()
Premium Features
Must Add:
Gradient hero text
Floating cards
Motion transitions
Research paper feel
Enterprise dashboard polish
TensorBoard-like graph section
Curriculum timeline visualization
shadcn Components To Install
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add select
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add accordion
npx shadcn-ui@latest add sheet
npx shadcn-ui@latest add sidebar
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add table
npx shadcn-ui@latest add scroll-area
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add breadcrumb
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add skeleton
npx shadcn-ui@latest add alert
Final Instruction to Copilot
EXTREMELY IMPORTANT:

“Do not build a generic AI dashboard. Build a polished research-grade Adaptive Curriculum Learning + Curriculum-Centric Distillation platform that visually communicates advanced ML experimentation, difficulty-aware training, pacing strategies, TensorBoard-style monitoring, and enterprise-grade AI tooling.

Prioritize:

Premium UI sophistication
Research visualization
Curriculum learning identity
Distillation workflow clarity
Component modularity
Production-readiness

This should feel like a deployable AI research SaaS product, not a student interface.”