"use client"

import type React from "react"

import {
  Calendar,
  Home,
  Settings,
  BarChart3,
  TrendingUp,
  DollarSign,
  FileText,
  Users,
  Bell,
  HelpCircle,
  LogOut,
  Zap,
  Shield,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "John Trader",
    email: "john@trademaster.com",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: Home,
      isActive: true,
      gradient: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
      textColor: "text-blue-600",
    },
    {
      title: "Trade Journal",
      url: "#",
      icon: FileText,
      badge: "12",
      gradient: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50 dark:bg-indigo-950/20",
      textColor: "text-indigo-600",
    },
    {
      title: "Analytics",
      url: "#",
      icon: BarChart3,
      gradient: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
      textColor: "text-purple-600",
    },
    {
      title: "Performance",
      url: "#",
      icon: TrendingUp,
      gradient: "from-teal-500 to-teal-600",
      bgColor: "bg-teal-50 dark:bg-teal-950/20",
      textColor: "text-teal-600",
    },
    {
      title: "Risk Management",
      url: "#",
      icon: Shield,
      gradient: "from-slate-500 to-slate-600",
      bgColor: "bg-slate-50 dark:bg-slate-950/20",
      textColor: "text-slate-600",
    },
    {
      title: "P&L Reports",
      url: "#",
      icon: DollarSign,
      gradient: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/20",
      textColor: "text-emerald-600",
    },
  ],
  navSecondary: [
    {
      title: "Trading Calendar",
      url: "#",
      icon: Calendar,
      gradient: "from-blue-500 to-indigo-500",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
      textColor: "text-blue-600",
    },
    {
      title: "Notifications",
      url: "#",
      icon: Bell,
      badge: "3",
      gradient: "from-amber-500 to-orange-500",
      bgColor: "bg-amber-50 dark:bg-amber-950/20",
      textColor: "text-amber-600",
    },
    {
      title: "Community",
      url: "#",
      icon: Users,
      gradient: "from-purple-500 to-indigo-500",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
      textColor: "text-purple-600",
    },
    {
      title: "AI Insights",
      url: "#",
      icon: Zap,
      badge: "New",
      gradient: "from-cyan-500 to-blue-500",
      bgColor: "bg-cyan-50 dark:bg-cyan-950/20",
      textColor: "text-cyan-600",
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" className="border-r-0" {...props}>
      <SidebarHeader className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 border-b border-blue-500/20">
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
            <BarChart3 className="size-5 text-white" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-bold text-white text-lg">TradeMaster Pro</span>
            <span className="truncate text-xs text-blue-200">Professional Trading Platform</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-gradient-to-b from-slate-900 to-slate-800">
        <SidebarGroup className="px-3 py-4">
          <SidebarGroupLabel className="text-blue-300 font-semibold text-xs uppercase tracking-wider mb-3">
            Trading Hub
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {data.navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={item.isActive}
                    className={`
                      relative overflow-hidden transition-all duration-300 hover:scale-105
                      ${item.isActive ? `${item.bgColor} border border-opacity-30 shadow-lg` : "hover:bg-slate-700/50"}
                    `}
                  >
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${item.gradient} shadow-md`}>
                      <item.icon className="size-4 text-white" />
                    </div>
                    <span className={`font-medium ${item.isActive ? item.textColor : "text-slate-300"}`}>
                      {item.title}
                    </span>
                    {item.badge && (
                      <Badge
                        variant="secondary"
                        className={`ml-auto bg-gradient-to-r ${item.gradient} text-white border-0 shadow-sm`}
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="px-3 py-4">
          <SidebarGroupLabel className="text-blue-300 font-semibold text-xs uppercase tracking-wider mb-3">
            Tools & Insights
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {data.navSecondary.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    className="relative overflow-hidden transition-all duration-300 hover:scale-105 hover:bg-slate-700/50"
                  >
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${item.gradient} shadow-md`}>
                      <item.icon className="size-4 text-white" />
                    </div>
                    <span className="font-medium text-slate-300">{item.title}</span>
                    {item.badge && (
                      <Badge
                        variant="secondary"
                        className={`ml-auto bg-gradient-to-r ${item.gradient} text-white border-0 shadow-sm text-xs`}
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="px-3 py-4 mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton className="transition-all duration-300 hover:scale-105 hover:bg-slate-700/50">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-slate-600 to-slate-500 shadow-md">
                    <Settings className="size-4 text-white" />
                  </div>
                  <span className="font-medium text-slate-300">Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="transition-all duration-300 hover:scale-105 hover:bg-slate-700/50">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-slate-600 to-slate-500 shadow-md">
                    <HelpCircle className="size-4 text-white" />
                  </div>
                  <span className="font-medium text-slate-300">Help & Support</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-gradient-to-r from-slate-900 to-blue-900 border-t border-blue-500/20">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="p-4 hover:bg-blue-800/30 transition-all duration-300">
              <Avatar className="h-8 w-8 ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-900">
                <AvatarImage src={data.user.avatar || "/placeholder.svg"} alt={data.user.name} />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold">
                  JT
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-white">{data.user.name}</span>
                <span className="truncate text-xs text-blue-200">{data.user.email}</span>
              </div>
              <div className="p-1 rounded-md bg-gradient-to-r from-red-500 to-pink-500 shadow-md">
                <LogOut className="h-4 w-4 text-white" />
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
