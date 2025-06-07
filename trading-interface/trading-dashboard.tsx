"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Activity,
  Star,
  Search,
  Bell,
  Settings,
  User,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  EyeOff,
} from "lucide-react"

export default function TradingDashboard() {
  const [balanceVisible, setBalanceVisible] = useState(true)
  const [selectedTimeframe, setSelectedTimeframe] = useState("1D")

  const portfolioData = {
    totalValue: 125847.32,
    dayChange: 2847.21,
    dayChangePercent: 2.31,
    positions: [
      {
        symbol: "AAPL",
        name: "Apple Inc.",
        price: 178.32,
        change: 2.45,
        changePercent: 1.39,
        shares: 50,
        value: 8916.0,
      },
      {
        symbol: "TSLA",
        name: "Tesla Inc.",
        price: 248.87,
        change: -5.23,
        changePercent: -2.06,
        shares: 25,
        value: 6221.75,
      },
      {
        symbol: "NVDA",
        name: "NVIDIA Corp.",
        price: 892.45,
        change: 15.67,
        changePercent: 1.79,
        shares: 15,
        value: 13386.75,
      },
      {
        symbol: "MSFT",
        name: "Microsoft Corp.",
        price: 412.78,
        change: 8.92,
        changePercent: 2.21,
        shares: 30,
        value: 12383.4,
      },
    ],
  }

  const watchlist = [
    { symbol: "BTC", name: "Bitcoin", price: 67234.56, change: 1234.78, changePercent: 1.87 },
    { symbol: "ETH", name: "Ethereum", price: 3456.78, change: -89.23, changePercent: -2.52 },
    { symbol: "GOOGL", name: "Alphabet Inc.", price: 142.65, change: 3.21, changePercent: 2.3 },
    { symbol: "AMZN", name: "Amazon.com Inc.", price: 156.78, change: -2.45, changePercent: -1.54 },
  ]

  const timeframes = ["1H", "1D", "1W", "1M", "3M", "1Y"]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              TradePro
            </h1>
            <p className="text-sm text-gray-400">Professional Trading Platform</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search assets..."
              className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder-gray-400 w-64"
            />
          </div>
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
            <Bell className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
            <Settings className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
            <User className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-6">
        {/* Portfolio Overview */}
        <div className="col-span-12 lg:col-span-8">
          <Card className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-slate-600 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold text-white">Portfolio Overview</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setBalanceVisible(!balanceVisible)}
                  className="text-gray-400 hover:text-white"
                >
                  {balanceVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center md:text-left">
                  <p className="text-sm text-gray-400 mb-1">Total Portfolio Value</p>
                  <p className="text-3xl font-bold text-white">
                    {balanceVisible ? `$${portfolioData.totalValue.toLocaleString()}` : "••••••"}
                  </p>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-sm text-gray-400 mb-1">Today's Change</p>
                  <div className="flex items-center justify-center md:justify-start space-x-2">
                    <span
                      className={`text-2xl font-bold ${portfolioData.dayChange >= 0 ? "text-green-400" : "text-red-400"}`}
                    >
                      {balanceVisible ? `$${portfolioData.dayChange.toLocaleString()}` : "••••••"}
                    </span>
                    {portfolioData.dayChange >= 0 ? (
                      <TrendingUp className="w-6 h-6 text-green-400" />
                    ) : (
                      <TrendingDown className="w-6 h-6 text-red-400" />
                    )}
                  </div>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-sm text-gray-400 mb-1">Performance</p>
                  <Badge
                    variant="secondary"
                    className={`text-lg px-3 py-1 ${
                      portfolioData.dayChangePercent >= 0
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : "bg-red-500/20 text-red-400 border-red-500/30"
                    }`}
                  >
                    {portfolioData.dayChangePercent >= 0 ? "+" : ""}
                    {portfolioData.dayChangePercent}%
                  </Badge>
                </div>
              </div>

              {/* Chart Placeholder */}
              <div className="bg-slate-900/50 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Portfolio Performance</h3>
                  <div className="flex space-x-2">
                    {timeframes.map((tf) => (
                      <Button
                        key={tf}
                        variant={selectedTimeframe === tf ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setSelectedTimeframe(tf)}
                        className={
                          selectedTimeframe === tf ? "bg-blue-600 hover:bg-blue-700" : "text-gray-400 hover:text-white"
                        }
                      >
                        {tf}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="h-64 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Activity className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-400">Interactive Chart</p>
                    <p className="text-sm text-gray-500">Real-time portfolio performance</p>
                  </div>
                </div>
              </div>

              {/* Holdings */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Current Holdings</h3>
                <div className="space-y-3">
                  {portfolioData.positions.map((position) => (
                    <div
                      key={position.symbol}
                      className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold">{position.symbol.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-white">{position.symbol}</p>
                          <p className="text-sm text-gray-400">{position.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-white">${position.price.toFixed(2)}</p>
                        <div className="flex items-center space-x-1">
                          <span className={`text-sm ${position.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                            {position.change >= 0 ? "+" : ""}${position.change.toFixed(2)}
                          </span>
                          {position.change >= 0 ? (
                            <ArrowUpRight className="w-3 h-3 text-green-400" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3 text-red-400" />
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-white">${position.value.toLocaleString()}</p>
                        <p className="text-sm text-gray-400">{position.shares} shares</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Quick Actions */}
          <Card className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-slate-600 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800">
                <DollarSign className="w-4 h-4 mr-2" />
                Buy Assets
              </Button>
              <Button variant="outline" className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10">
                <TrendingDown className="w-4 h-4 mr-2" />
                Sell Assets
              </Button>
              <Button variant="outline" className="w-full border-slate-600 text-gray-300 hover:bg-slate-700">
                <Wallet className="w-4 h-4 mr-2" />
                Deposit Funds
              </Button>
            </CardContent>
          </Card>

          {/* Watchlist */}
          <Card className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-slate-600 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-white">Watchlist</CardTitle>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <Star className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {watchlist.map((asset) => (
                <div
                  key={asset.symbol}
                  className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer"
                >
                  <div>
                    <p className="font-semibold text-white">{asset.symbol}</p>
                    <p className="text-xs text-gray-400">{asset.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-white">${asset.price.toLocaleString()}</p>
                    <div className="flex items-center space-x-1">
                      <span className={`text-xs ${asset.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {asset.changePercent >= 0 ? "+" : ""}
                        {asset.changePercent}%
                      </span>
                      {asset.change >= 0 ? (
                        <ArrowUpRight className="w-3 h-3 text-green-400" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3 text-red-400" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Market Stats */}
          <Card className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-slate-600 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white">Market Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">S&P 500</span>
                <div className="text-right">
                  <span className="text-white font-semibold">4,567.89</span>
                  <span className="text-green-400 text-sm ml-2">+1.23%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">NASDAQ</span>
                <div className="text-right">
                  <span className="text-white font-semibold">14,234.56</span>
                  <span className="text-red-400 text-sm ml-2">-0.45%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">DOW</span>
                <div className="text-right">
                  <span className="text-white font-semibold">34,567.12</span>
                  <span className="text-green-400 text-sm ml-2">+0.78%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trading Interface */}
        <div className="col-span-12">
          <Card className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-slate-600 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-white">Trading Terminal</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="buy" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-slate-800">
                  <TabsTrigger value="buy" className="data-[state=active]:bg-green-600">
                    Buy
                  </TabsTrigger>
                  <TabsTrigger value="sell" className="data-[state=active]:bg-red-600">
                    Sell
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="buy" className="space-y-4 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Asset</label>
                      <Input
                        placeholder="Enter symbol (e.g., AAPL)"
                        className="bg-slate-800/50 border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Quantity</label>
                      <Input placeholder="0" type="number" className="bg-slate-800/50 border-slate-700 text-white" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Price</label>
                      <Input placeholder="Market Price" className="bg-slate-800/50 border-slate-700 text-white" />
                    </div>
                  </div>
                  <div className="flex space-x-4">
                    <Button className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800">
                      Place Buy Order
                    </Button>
                    <Button variant="outline" className="border-slate-600 text-gray-300 hover:bg-slate-700">
                      Preview Order
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="sell" className="space-y-4 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Asset</label>
                      <Input
                        placeholder="Enter symbol (e.g., AAPL)"
                        className="bg-slate-800/50 border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Quantity</label>
                      <Input placeholder="0" type="number" className="bg-slate-800/50 border-slate-700 text-white" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Price</label>
                      <Input placeholder="Market Price" className="bg-slate-800/50 border-slate-700 text-white" />
                    </div>
                  </div>
                  <div className="flex space-x-4">
                    <Button className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800">
                      Place Sell Order
                    </Button>
                    <Button variant="outline" className="border-slate-600 text-gray-300 hover:bg-slate-700">
                      Preview Order
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
