"use client"

import { useState } from "react"
import { AppSidebar } from "./components/app-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "./components/theme-toggle"
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  Tooltip,
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Filter,
  Download,
  MoreHorizontal,
  Eye,
  Activity,
  Zap,
} from "lucide-react"

export default function TradingDashboard() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("1M")

  // Real chart data
  const pnlData = [
    { date: "Jan 1", pnl: 0, cumulative: 0 },
    { date: "Jan 8", pnl: 1200, cumulative: 1200 },
    { date: "Jan 15", pnl: -300, cumulative: 900 },
    { date: "Jan 22", pnl: 2100, cumulative: 3000 },
    { date: "Jan 29", pnl: 800, cumulative: 3800 },
    { date: "Feb 5", pnl: -500, cumulative: 3300 },
    { date: "Feb 12", pnl: 1800, cumulative: 5100 },
    { date: "Feb 19", pnl: 2200, cumulative: 7300 },
    { date: "Feb 26", pnl: -200, cumulative: 7100 },
    { date: "Mar 5", pnl: 3200, cumulative: 10300 },
    { date: "Mar 12", pnl: 1500, cumulative: 11800 },
    { date: "Mar 19", pnl: -800, cumulative: 11000 },
    { date: "Mar 26", pnl: 2800, cumulative: 13800 },
  ]

  const winRateData = [
    { month: "Jan", wins: 15, losses: 5, winRate: 75 },
    { month: "Feb", wins: 18, losses: 4, winRate: 82 },
    { month: "Mar", wins: 22, losses: 6, winRate: 79 },
    { month: "Apr", wins: 20, losses: 3, winRate: 87 },
    { month: "May", wins: 16, losses: 7, winRate: 70 },
    { month: "Jun", wins: 25, losses: 5, winRate: 83 },
  ]

  const assetAllocation = [
    { name: "Stocks", value: 65, color: "#3b82f6" },
    { name: "Options", value: 20, color: "#8b5cf6" },
    { name: "Forex", value: 10, color: "#10b981" },
    { name: "Crypto", value: 5, color: "#f59e0b" },
  ]

  const dailyPnl = [
    { day: "Mon", pnl: 450 },
    { day: "Tue", pnl: -120 },
    { day: "Wed", pnl: 680 },
    { day: "Thu", pnl: 320 },
    { day: "Fri", pnl: 890 },
    { day: "Sat", pnl: 0 },
    { day: "Sun", pnl: 0 },
  ]

  const metrics = [
    {
      title: "Total P&L",
      value: "$47,832.50",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      description: "vs last month",
      gradient: "from-emerald-500 to-teal-500",
      bgGradient: "from-emerald-50/80 to-teal-50/80 dark:from-emerald-950/40 dark:to-teal-950/40",
      borderColor: "border-emerald-200/50 dark:border-emerald-800/50",
    },
    {
      title: "Win Rate",
      value: "78.4%",
      change: "+3.2%",
      trend: "up",
      icon: Target,
      description: "156 wins / 199 trades",
      gradient: "from-blue-500 to-indigo-500",
      bgGradient: "from-blue-50/80 to-indigo-50/80 dark:from-blue-950/40 dark:to-indigo-950/40",
      borderColor: "border-blue-200/50 dark:border-blue-800/50",
    },
    {
      title: "Profit Factor",
      value: "2.34",
      change: "+0.18",
      trend: "up",
      icon: TrendingUp,
      description: "Gross profit / Gross loss",
      gradient: "from-purple-500 to-indigo-500",
      bgGradient: "from-purple-50/80 to-indigo-50/80 dark:from-purple-950/40 dark:to-indigo-950/40",
      borderColor: "border-purple-200/50 dark:border-purple-800/50",
    },
    {
      title: "Max Drawdown",
      value: "-$2,150",
      change: "-1.2%",
      trend: "down",
      icon: TrendingDown,
      description: "Peak to trough decline",
      gradient: "from-slate-500 to-slate-600",
      bgGradient: "from-slate-50/80 to-slate-100/80 dark:from-slate-950/40 dark:to-slate-900/40",
      borderColor: "border-slate-200/50 dark:border-slate-700/50",
    },
  ]

  const recentTrades = [
    {
      id: "TRD-2024-001",
      symbol: "AAPL",
      side: "Long",
      entry: "$175.50",
      exit: "$182.30",
      quantity: 100,
      pnl: "+$680.00",
      pnlPercent: "+3.87%",
      date: "2024-01-15 14:30",
      status: "Closed",
      setup: "Breakout",
      rr: "1:2.8",
    },
    {
      id: "TRD-2024-002",
      symbol: "TSLA",
      side: "Short",
      entry: "$248.90",
      exit: "$235.20",
      quantity: 50,
      pnl: "+$685.00",
      pnlPercent: "+5.50%",
      date: "2024-01-14 10:15",
      status: "Closed",
      setup: "Reversal",
      rr: "1:3.2",
    },
    {
      id: "TRD-2024-003",
      symbol: "NVDA",
      side: "Long",
      entry: "$520.00",
      exit: "$508.50",
      quantity: 25,
      pnl: "-$287.50",
      pnlPercent: "-2.21%",
      date: "2024-01-13 11:45",
      status: "Closed",
      setup: "Support",
      rr: "1:1.5",
    },
    {
      id: "TRD-2024-004",
      symbol: "MSFT",
      side: "Long",
      entry: "$380.20",
      exit: "Open",
      quantity: 75,
      pnl: "+$450.00",
      pnlPercent: "+1.58%",
      date: "2024-01-12 09:30",
      status: "Open",
      setup: "Momentum",
      rr: "1:2.0",
    },
  ]

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1 text-primary hover:bg-accent hover:text-accent-foreground" />
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Trading Dashboard
              </h1>
              <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 shadow-md animate-pulse">
                <Activity className="w-3 h-3 mr-1" />
                Live
              </Badge>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-3 px-4">
            <ThemeToggle />
            <Tabs value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <TabsList className="grid w-full grid-cols-4 bg-muted/50 backdrop-blur">
                <TabsTrigger
                  value="1W"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  1W
                </TabsTrigger>
                <TabsTrigger
                  value="1M"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  1M
                </TabsTrigger>
                <TabsTrigger
                  value="3M"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  3M
                </TabsTrigger>
                <TabsTrigger
                  value="1Y"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  1Y
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300">
              <Plus className="h-4 w-4 mr-2" />
              New Trade
            </Button>
          </div>
        </header>

        <main className="flex-1 space-y-8 p-6 bg-background min-h-screen">
          {/* Welcome Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Welcome back, John! 👋</h2>
              <p className="text-muted-foreground mt-1 text-lg">Here's your trading performance overview</p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-md">
                <Zap className="w-3 h-3 mr-1" />
                AI Insights Available
              </Badge>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric, index) => (
              <Card
                key={index}
                className={`relative overflow-hidden border ${metric.borderColor} shadow-xl bg-card/95 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:border-primary/20`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${metric.bgGradient}`} />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{metric.title}</CardTitle>
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${metric.gradient} shadow-lg`}>
                    <metric.icon className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-bold text-foreground mb-2">{metric.value}</div>
                  <div className="flex items-center space-x-2">
                    {metric.trend === "up" ? (
                      <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-500" />
                    )}
                    <span
                      className={`text-sm font-semibold ${metric.trend === "up" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
                    >
                      {metric.change}
                    </span>
                    <span className="text-sm text-muted-foreground">{metric.description}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid gap-8 lg:grid-cols-3">
            {/* P&L Chart */}
            <Card className="lg:col-span-2 border border-border/40 shadow-xl bg-card/95 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-foreground">Cumulative P&L Performance</CardTitle>
                    <CardDescription className="text-muted-foreground">Your trading journey over time</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-border hover:bg-accent hover:text-accent-foreground"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-border hover:bg-accent hover:text-accent-foreground"
                    >
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="h-[350px] w-full bg-gradient-to-br from-blue-50/50 via-indigo-50/50 to-purple-50/50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 rounded-xl p-4 border border-border/20">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={pnlData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <defs>
                        <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                        stroke="hsl(var(--border))"
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                        tickFormatter={(value) => `$${value.toLocaleString()}`}
                        stroke="hsl(var(--border))"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "12px",
                          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                          color: "hsl(var(--popover-foreground))",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="cumulative"
                        stroke="#3b82f6"
                        strokeWidth={4}
                        fill="url(#pnlGradient)"
                        animationDuration={2000}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Asset Allocation */}
            <Card className="border border-border/40 shadow-xl bg-card/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-foreground">Asset Allocation</CardTitle>
                <CardDescription className="text-muted-foreground">Portfolio distribution</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="h-[300px] w-full bg-gradient-to-br from-emerald-50/50 via-teal-50/50 to-cyan-50/50 dark:from-emerald-950/20 dark:via-teal-950/20 dark:to-cyan-950/20 rounded-xl p-4 border border-border/20">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={assetAllocation}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        animationDuration={2000}
                        animationBegin={500}
                      >
                        {assetAllocation.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "12px",
                          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                          color: "hsl(var(--popover-foreground))",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6 space-y-3">
                  {assetAllocation.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/20"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="h-4 w-4 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                        <span className="font-medium text-foreground">{item.name}</span>
                      </div>
                      <span className="font-bold text-foreground">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Second Row Charts */}
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Win Rate Trend */}
            <Card className="border border-border/40 shadow-xl bg-card/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-foreground">Win Rate Evolution</CardTitle>
                <CardDescription className="text-muted-foreground">Monthly performance trends</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="h-[280px] w-full bg-gradient-to-br from-purple-50/50 via-indigo-50/50 to-blue-50/50 dark:from-purple-950/20 dark:via-indigo-950/20 dark:to-blue-950/20 rounded-xl p-4 border border-border/20">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={winRateData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                        stroke="hsl(var(--border))"
                      />
                      <YAxis
                        domain={[60, 90]}
                        tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                        tickFormatter={(value) => `${value}%`}
                        stroke="hsl(var(--border))"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "12px",
                          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                          color: "hsl(var(--popover-foreground))",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="winRate"
                        stroke="#8b5cf6"
                        strokeWidth={4}
                        dot={{ fill: "#8b5cf6", strokeWidth: 3, r: 6 }}
                        activeDot={{ r: 8, fill: "#8b5cf6", stroke: "#fff", strokeWidth: 2 }}
                        animationDuration={1500}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Daily P&L */}
            <Card className="border border-border/40 shadow-xl bg-card/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-foreground">This Week's Performance</CardTitle>
                <CardDescription className="text-muted-foreground">Daily P&L breakdown</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="h-[280px] w-full bg-gradient-to-br from-emerald-50/50 via-green-50/50 to-teal-50/50 dark:from-emerald-950/20 dark:via-green-950/20 dark:to-teal-950/20 rounded-xl p-4 border border-border/20">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyPnl} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#059669" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                      <XAxis
                        dataKey="day"
                        tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                        stroke="hsl(var(--border))"
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                        tickFormatter={(value) => `$${value}`}
                        stroke="hsl(var(--border))"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "12px",
                          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                          color: "hsl(var(--popover-foreground))",
                        }}
                      />
                      <Bar dataKey="pnl" fill="url(#barGradient)" radius={[6, 6, 0, 0]} animationDuration={1500} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Trades */}
          <Card className="border border-border/40 shadow-xl bg-card/95 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-foreground">Recent Trading Activity</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Your latest trades and performance
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border hover:bg-accent hover:text-accent-foreground"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border hover:bg-accent hover:text-accent-foreground"
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="font-semibold text-muted-foreground">Trade ID</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Symbol</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Side</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Entry</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Exit</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Qty</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">P&L</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">%</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">R:R</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Setup</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Date</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Status</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentTrades.map((trade, index) => (
                      <TableRow key={trade.id} className="border-border hover:bg-accent/50 transition-all duration-200">
                        <TableCell className="font-mono text-xs text-muted-foreground">{trade.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center text-primary-foreground text-xs font-bold shadow-md">
                              {trade.symbol.charAt(0)}
                            </div>
                            <span className="font-semibold text-foreground">{trade.symbol}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={trade.side === "Long" ? "default" : "secondary"}
                            className={
                              trade.side === "Long"
                                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0"
                                : "bg-gradient-to-r from-slate-500 to-slate-600 text-white border-0"
                            }
                          >
                            {trade.side}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-foreground">{trade.entry}</TableCell>
                        <TableCell className="font-medium text-foreground">{trade.exit}</TableCell>
                        <TableCell className="text-foreground">{trade.quantity}</TableCell>
                        <TableCell>
                          <span
                            className={`font-bold ${trade.pnl.startsWith("+") ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
                          >
                            {trade.pnl}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`text-sm font-semibold ${trade.pnlPercent.startsWith("+") ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
                          >
                            {trade.pnlPercent}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm font-medium text-foreground">{trade.rr}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-primary/20 text-primary bg-primary/10">
                            {trade.setup}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{trade.date}</TableCell>
                        <TableCell>
                          <Badge
                            variant={trade.status === "Closed" ? "secondary" : "default"}
                            className={
                              trade.status === "Open"
                                ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0 animate-pulse"
                                : "bg-muted text-muted-foreground"
                            }
                          >
                            {trade.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" className="hover:bg-accent hover:text-accent-foreground">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
