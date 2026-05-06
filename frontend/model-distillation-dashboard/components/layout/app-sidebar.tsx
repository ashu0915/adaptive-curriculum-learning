// components/sidebar/app-sidebar.tsx
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  FileText,
  BookOpen,
  Users,
  BrainCircuit,
  PanelLeftClose,
  PanelLeftOpen,
  Loader
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { title } from "process"

const navigation = [
  {
    title: "Home",
    href: "/",
    icon: Home,
  },
  {
    title: "Train",
    href: "/train",
    icon: Loader
  },
  // {
  //   title: "Documents",
  //   href: "/document",
  //   icon: FileText,
  // },
  {
    title: "References",
    href: "/references",
    icon: BookOpen,
  },
  {
    title: "About Team",
    href: "/about",
    icon: Users,
  },
]

function SidebarCollapseToggle() {
  const { state, toggleSidebar } = useSidebar()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleSidebar}
      className={cn(
        "h-9 w-9 rounded-xl border border-border/50",
        "bg-background/40 backdrop-blur-md",
        "hover:bg-accent hover:text-accent-foreground",
        "transition-all duration-300"
      )}
    >
      {state === "collapsed" ? (
        <PanelLeftOpen className="h-5 w-5" />
      ) : (
        <PanelLeftClose className="h-5 w-5" />
      )}
    </Button>
  )
}

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar
      collapsible="icon"
      className={cn(
        "border-r border-border/50",
        "bg-background/80 backdrop-blur-xl",
        "supports-[backdrop-filter]:bg-background/60"
      )}
    >
      {/* Header */}
      <SidebarHeader className="px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
                "bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600",
                "shadow-lg shadow-blue-500/20"
              )}
            >
              <BrainCircuit className="h-6 w-6 text-white" />
            </div>

            <div className="min-w-0 group-data-[collapsible=icon]:hidden">
              <h1 className="truncate text-sm font-semibold tracking-tight text-foreground">
                ACL Training Studio
              </h1>
              <p className="truncate text-xs text-muted-foreground">
                Adaptive Curriculum AI
              </p>
            </div>
          </div>

          <div className="group-data-[collapsible=icon]:hidden">
            <SidebarCollapseToggle />
          </div>
        </div>

        <div className="mt-4 group-data-[collapsible=icon]:hidden">
          <Separator className="bg-border/60" />
        </div>
      </SidebarHeader>

      {/* Main Nav */}
      <SidebarContent className="px-3 py-4">
        <SidebarMenu className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-3 rounded-2xl px-3 py-3",
                      "transition-all duration-300",
                      isActive
                        ? [
                            "bg-gradient-to-r from-blue-600/90 to-purple-600/90",
                            "text-white shadow-md shadow-blue-500/20",
                          ]
                        : [
                            "text-muted-foreground",
                            "hover:bg-accent/70 hover:text-accent-foreground",
                          ]
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5 shrink-0 transition-transform duration-300",
                        !isActive && "group-hover:scale-110"
                      )}
                    />

                    <span className="truncate text-sm font-medium group-data-[collapsible=icon]:hidden">
                      {item.title}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="px-3 py-4">
        <div
          className={cn(
            "rounded-2xl border border-border/50 p-3",
            "bg-gradient-to-br from-background to-muted/40",
            "group-data-[collapsible=icon]:hidden"
          )}
        >
          <p className="text-xs font-medium text-foreground">
            Curriculum-Centric Distillation
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            Research-grade teacher-guided adaptive pacing framework.
          </p>
        </div>

        <div className="mt-3 hidden justify-center group-data-[collapsible=icon]:flex">
          <SidebarCollapseToggle />
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}