"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const TEAM_MEMBERS = [
  {
    name: "Haneen Ajaz",
    role: "Team Lead",
    bio: "Led the project, coordinated research efforts, and contributed to UI design and development.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emma",
  },
  {
    name: "Ayushi Sisodia",
    role: "Frontend Engineer",
    bio: "Managed frontend development, prepared project documentation, and contributed to research work.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
  },
  {
    name: "Akshit Tyagi",
    role: "Backend Engineer",
    bio: "Worked on backend development, system integration, and contributed to research activities.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
  },
  {
    name: "Ashutosh Pandey",
    role: "Backend Engineer",
    bio: "Developed the backend architecture, implemented core system logic, and contributed to research and technical analysis.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=james",
  },
]

export default function AboutPage() {
  return (
    <div className="py-8 px-4 md:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">About ACL Studio</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          ACL Studio is a research-grade platform for curriculum-centric distillation and adaptive curriculum learning. We enable teams to build smaller, smarter models with progressive difficulty scheduling.
        </p>
      </div>

      {/* Mission & Vision */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Our Mission</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-600 dark:text-slate-400">
              To democratize curriculum-centric distillation and adaptive learning research, enabling teams to build efficient, scalable AI systems that understand sample difficulty.
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-blue-600">✓</span> Make distillation accessible
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-600">✓</span> Reduce computational overhead
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-600">✓</span> Accelerate AI deployment
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Our Vision</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-600 dark:text-slate-400">
              ACL Studio will be the industry standard for curriculum-centric distillation research, trusted by leading organizations to deploy adaptive, efficient AI.
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-purple-600">✓</span> Industry leadership
              </li>
              <li className="flex items-center gap-2">
                <span className="text-purple-600">✓</span> Sustainable AI
              </li>
              <li className="flex items-center gap-2">
                <span className="text-purple-600">✓</span> Innovation catalyst
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Team */}
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Our Team</h2>
          <p className="text-slate-600 dark:text-slate-400">
            World-class experts in AI research, engineering, and enterprise software
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {TEAM_MEMBERS.map((member) => (
            <Card key={member.name}>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback>{member.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{member.name}</CardTitle>
                    <Badge variant="secondary" className="mt-1">{member.role}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  {member.bio}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Innovation */}
      <Card className="border-purple-200 dark:border-purple-900 bg-purple-50 dark:bg-purple-900/20">
        <CardHeader>
          <CardTitle>Innovation & Impact</CardTitle>
          <CardDescription>Pioneering the next generation of model optimization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="research" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="research">Research</TabsTrigger>
              <TabsTrigger value="technology">Technology</TabsTrigger>
              <TabsTrigger value="impact">Impact</TabsTrigger>
            </TabsList>
            <TabsContent value="research" className="space-y-4 mt-4">
              <p className="text-slate-700 dark:text-slate-300">
                Our research team continuously pushes the boundaries of model distillation, 
                publishing and collaborating with leading universities and AI labs worldwide.
              </p>
            </TabsContent>
            <TabsContent value="technology" className="space-y-4 mt-4">
              <p className="text-slate-700 dark:text-slate-300">
                We leverage cutting-edge techniques in knowledge distillation, neural architecture 
                search, and quantization to deliver unprecedented model compression.
              </p>
            </TabsContent>
            <TabsContent value="impact" className="space-y-4 mt-4">
              <p className="text-slate-700 dark:text-slate-300">
                DistillX helps organizations reduce their AI infrastructure costs by up to 90% 
                while improving deployment speed and sustainability.
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Stats */}
      {/* <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Models Distilled</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">1.2K+</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">500+</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Speedup</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">8.5x</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Size Reduction</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">87%</p>
          </CardContent>
        </Card>
      </div> */}
    </div>
  )
}
