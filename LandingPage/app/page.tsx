"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { config } from "@/lib/config"
import {
  BarChart3,
  Target,
  Brain,
  Zap,
  Star,
  ArrowRight,
  CheckCircle,
  Play,
  Menu,
  X,
  Activity,
  PieChart,
  Calendar,
  BookOpen,
  Award,
  Sparkles,
} from "lucide-react"

export default function TradingFrameworkLanding() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  const handleSignIn = () => {
    // Store the current URL to return after authentication
    const returnUrl = window.location.href
    // Redirect to the auth URL with the return URL as a parameter
    window.location.href = `${config.authRedirectUrl}?returnUrl=${encodeURIComponent(returnUrl)}`
  }

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Day Trader",
      image: "/placeholder.svg?height=60&width=60",
      content:
        "TradeInsight transformed my trading completely. I went from losing money to consistent 15% monthly returns.",
      rating: 5,
    },
    {
      name: "Marcus Rodriguez",
      role: "Swing Trader",
      image: "/placeholder.svg?height=60&width=60",
      content: "The AI insights are incredible. It spotted patterns in my trades that I never would have noticed.",
      rating: 5,
    },
    {
      name: "Emily Johnson",
      role: "Options Trader",
      image: "/placeholder.svg?height=60&width=60",
      content: "Finally, a platform that actually helps me improve. The detailed analytics are game-changing.",
      rating: 5,
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      {/* Navigation */}
      <nav className="relative z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
              TradeInsight
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors">
              Features
            </a>
            <a href="#analytics" className="text-gray-300 hover:text-white transition-colors">
              Analytics
            </a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">
              Pricing
            </a>
            <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors">
              Reviews
            </a>
            <Button 
              variant="ghost" 
              className="text-gray-300 hover:text-white"
              onClick={handleSignIn}
            >
              Sign In
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Start Free Trial
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-[#0d1117]/95 backdrop-blur-lg border-t border-[#1f2937] p-6">
            <div className="space-y-4">
              <a href="#features" className="block text-gray-300 hover:text-white transition-colors">
                Features
              </a>
              <a href="#analytics" className="block text-gray-300 hover:text-white transition-colors">
                Analytics
              </a>
              <a href="#pricing" className="block text-gray-300 hover:text-white transition-colors">
                Pricing
              </a>
              <a href="#testimonials" className="block text-gray-300 hover:text-white transition-colors">
                Reviews
              </a>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-gray-300 hover:text-white"
                onClick={handleSignIn}
              >
                Sign In
              </Button>
              <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Start Free Trial
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border-blue-500/30">
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI-Powered Trading Analytics
                </Badge>
                <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                    Transform Your
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Trading Game
                  </span>
                </h1>
                <p className="text-xl text-gray-300 leading-relaxed max-w-2xl">
                  The most advanced trading journal and analytics platform. Track every trade, discover hidden patterns,
                  and unlock consistent profitability with AI-powered insights.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-4"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-slate-600 text-white hover:bg-slate-800 text-lg px-8 py-4"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>
              </div>

              <div className="flex items-center space-x-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">50K+</div>
                  <div className="text-sm text-gray-400">Active Traders</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">$2.1B+</div>
                  <div className="text-sm text-gray-400">Trades Analyzed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">94%</div>
                  <div className="text-sm text-gray-400">Success Rate</div>
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-3xl"></div>
              <Card className="bg-[#0d1117] border-[#1f2937]/50 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-white">Trading Performance</h3>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">+24.7% This Month</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#161b22] rounded-lg p-4">
                        <div className="text-2xl font-bold text-white">$127,450</div>
                        <div className="text-sm text-gray-400">Total P&L</div>
                      </div>
                      <div className="bg-[#161b22] rounded-lg p-4">
                        <div className="text-2xl font-bold text-green-400">73%</div>
                        <div className="text-sm text-gray-400">Win Rate</div>
                      </div>
                    </div>

                    <div className="bg-[#161b22] rounded-lg p-6 h-32 flex items-center justify-center">
                      <div className="text-center">
                        <Activity className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                        <div className="text-sm text-gray-400">Live Performance Chart</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Recent Trades</span>
                        <span className="text-green-400">+$2,340</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Risk Score</span>
                        <span className="text-yellow-400">Medium</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">AI Confidence</span>
                        <span className="text-blue-400">High</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-20 bg-gradient-to-b from-transparent to-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border-blue-500/30 mb-4">
              Powerful Features
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Everything You Need to
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Master Trading
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              From advanced analytics to AI-powered insights, TradeInsight provides all the tools you need to become a
              consistently profitable trader.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "AI-Powered Insights",
                description:
                  "Advanced machine learning algorithms analyze your trades to identify patterns and opportunities.",
                gradient: "from-blue-500 to-cyan-500",
              },
              {
                icon: BarChart3,
                title: "Advanced Analytics",
                description: "Comprehensive performance metrics, risk analysis, and detailed trade breakdowns.",
                gradient: "from-purple-500 to-pink-500",
              },
              {
                icon: BookOpen,
                title: "Smart Trade Journal",
                description: "Automatically import trades and add context with our intelligent journaling system.",
                gradient: "from-green-500 to-emerald-500",
              },
              {
                icon: Target,
                title: "Risk Management",
                description: "Real-time risk assessment and position sizing recommendations to protect your capital.",
                gradient: "from-orange-500 to-red-500",
              },
              {
                icon: PieChart,
                title: "Portfolio Tracking",
                description: "Monitor your entire portfolio across multiple brokers and asset classes in one place.",
                gradient: "from-indigo-500 to-blue-500",
              },
              {
                icon: Zap,
                title: "Real-time Alerts",
                description: "Get notified about important market events and trading opportunities instantly.",
                gradient: "from-yellow-500 to-orange-500",
              },
            ].map((feature, index) => (
              <Card key={index} className="bg-[#0d1117] border-[#1f2937]/50 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div
                    className={`w-12 h-12 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center mb-6`}
                  >
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Analytics Showcase */}
      <section id="analytics" className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <Badge className="bg-gradient-to-r from-green-500/20 to-blue-500/20 text-green-300 border-green-500/30 mb-4">
                  Advanced Analytics
                </Badge>
                <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Deep Insights Into
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                    Your Trading
                  </span>
                </h2>
                <p className="text-xl text-gray-300 leading-relaxed">
                  Discover hidden patterns, optimize your strategies, and make data-driven decisions with our
                  comprehensive analytics suite.
                </p>
              </div>

              <div className="space-y-6">
                {[
                  {
                    icon: Activity,
                    title: "Performance Metrics",
                    description: "Track Sharpe ratio, maximum drawdown, win rate, and 20+ other key metrics.",
                  },
                  {
                    icon: Calendar,
                    title: "Time-based Analysis",
                    description: "Identify your best trading times, days, and market conditions.",
                  },
                  {
                    icon: Award,
                    title: "Strategy Comparison",
                    description: "Compare different strategies and optimize your approach for maximum profitability.",
                  },
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                      <p className="text-gray-300">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-3xl blur-3xl"></div>
              <Card className="bg-[#0d1117] border-[#1f2937]/50 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-white">Analytics Dashboard</h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#161b22] rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-green-400">2.34</div>
                        <div className="text-sm text-gray-400">Sharpe Ratio</div>
                      </div>
                      <div className="bg-[#161b22] rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-blue-400">-8.2%</div>
                        <div className="text-sm text-gray-400">Max Drawdown</div>
                      </div>
                    </div>

                    <div className="bg-[#161b22] rounded-lg p-6 h-40 flex items-center justify-center">
                      <div className="text-center">
                        <PieChart className="w-12 h-12 text-green-400 mx-auto mb-2" />
                        <div className="text-sm text-gray-400">Strategy Performance Breakdown</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Best Trading Day</span>
                        <span className="text-white">Tuesday</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Optimal Time</span>
                        <span className="text-white">9:30-11:00 AM</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Top Strategy</span>
                        <span className="text-green-400">Momentum</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="px-6 py-20 bg-gradient-to-b from-slate-900/50 to-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 border-yellow-500/30 mb-4">
            Testimonials
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold mb-16">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Loved by Traders
            </span>
            <br />
            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              Worldwide
            </span>
          </h2>

          <Card className="bg-[#0d1117] border-[#1f2937]/50 backdrop-blur-sm">
            <CardContent className="p-12">
              <div className="flex justify-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-2xl text-white mb-8 leading-relaxed">
                "{testimonials[currentTestimonial].content}"
              </blockquote>
              <div className="flex items-center justify-center space-x-4">
                <img
                  src={testimonials[currentTestimonial].image || "/placeholder.svg"}
                  alt={testimonials[currentTestimonial].name}
                  className="w-12 h-12 rounded-full"
                />
                <div className="text-left">
                  <div className="font-semibold text-white">{testimonials[currentTestimonial].name}</div>
                  <div className="text-gray-400">{testimonials[currentTestimonial].role}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center space-x-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentTestimonial ? "bg-blue-500" : "bg-slate-600"
                }`}
                onClick={() => setCurrentTestimonial(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/30 mb-4">
              Simple Pricing
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Choose Your Plan
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Start free and upgrade as you grow. All plans include our core features with no hidden fees.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Starter",
                price: "Free",
                description: "Perfect for beginners",
                features: ["Up to 100 trades/month", "Basic analytics", "Trade journal", "Email support"],
                gradient: "from-slate-700 to-slate-600",
                popular: false,
              },
              {
                name: "Professional",
                price: "$29",
                description: "For serious traders",
                features: [
                  "Unlimited trades",
                  "Advanced analytics",
                  "AI insights",
                  "Risk management tools",
                  "Priority support",
                  "Custom reports",
                ],
                gradient: "from-blue-600 to-purple-600",
                popular: true,
              },
              {
                name: "Enterprise",
                price: "$99",
                description: "For trading firms",
                features: [
                  "Everything in Professional",
                  "Team collaboration",
                  "API access",
                  "White-label options",
                  "Dedicated support",
                  "Custom integrations",
                ],
                gradient: "from-purple-600 to-pink-600",
                popular: false,
              },
            ].map((plan, index) => (
              <Card
                key={index}
                className={`relative bg-[#0d1117] border-[#1f2937]/50 backdrop-blur-sm ${
                  plan.popular ? "scale-105 border-blue-500/50" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <p className="text-gray-400 mb-4">{plan.description}</p>
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-white">{plan.price}</span>
                      {plan.price !== "Free" && <span className="text-gray-400">/month</span>}
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <span className="text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    className={`w-full ${
                      plan.popular
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        : "bg-slate-700 hover:bg-slate-600 text-white"
                    }`}
                  >
                    {plan.price === "Free" ? "Get Started" : "Start Free Trial"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-[#0d1117]/70">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Ready to Transform
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Your Trading?
            </span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of traders who have already improved their performance with TradeInsight. Start your free
            trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-4"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-slate-600 text-white hover:bg-slate-800 text-lg px-8 py-4"
            >
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-[#1f2937]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <span className="text-xl font-bold text-white">TradeInsight</span>
              </div>
              <p className="text-gray-400">The most advanced trading analytics platform for serious traders.</p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Product</h3>
              <div className="space-y-2">
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">
                  Features
                </a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">
                  Pricing
                </a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">
                  API
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <div className="space-y-2">
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">
                  About
                </a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">
                  Blog
                </a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">
                  Careers
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Support</h3>
              <div className="space-y-2">
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">
                  Help Center
                </a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">
                  Contact
                </a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">
                  Status
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-[#1f2937] mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">© 2024 TradeInsight. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Privacy
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Terms
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Security
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
