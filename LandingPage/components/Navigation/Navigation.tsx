"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, BarChart3 } from "lucide-react"
import styles from './Navigation.module.css'

export const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleSignIn = () => {
    // Using window.location for external navigation to the main app
    window.location.href = 'http://localhost:5173'
  }

  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        <div className={styles.logoContainer}>
          <div className={styles.logoIcon}>
            <BarChart3 className="w-6 h-6" />
          </div>
          <span className={styles.logoText}>
            TradeInsight
          </span>
        </div>

        {/* Desktop Navigation */}
        <div className={styles.desktopNav}>
          <a href="#features" className={styles.navLink}>
            Features
          </a>
          <a href="#analytics" className={styles.navLink}>
            Analytics
          </a>
          <a href="#pricing" className={styles.navLink}>
            Pricing
          </a>
          <a href="#testimonials" className={styles.navLink}>
            Reviews
          </a>
          <Button 
            variant="ghost" 
            className={styles.navLink}
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
        <div className={styles.mobileMenu}>
          <div className={styles.mobileNavLinks}>
            <a href="#features" className={styles.navLink}>
              Features
            </a>
            <a href="#analytics" className={styles.navLink}>
              Analytics
            </a>
            <a href="#pricing" className={styles.navLink}>
              Pricing
            </a>
            <a href="#testimonials" className={styles.navLink}>
              Reviews
            </a>
            <Button 
              variant="ghost" 
              className={styles.navLink}
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
  )
} 