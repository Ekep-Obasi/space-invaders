"use client"

import { useState } from "react"
import Navigation from "@/components/navigation/navigation"
import WelcomeMessage from "@/components/welcome-message/welcome-message"
import styles from "./page.module.css"

export default function Home() {
  const [userName, setUserName] = useState("")
  const [showWelcome, setShowWelcome] = useState(false)

  // Event handler for form submission
  const handleNameSubmit = (e) => {
    e.preventDefault()
    if (userName.trim()) {
      setShowWelcome(true)
    }
  }

  // Event handler for name input change
  const handleNameChange = (e) => {
    setUserName(e.target.value)
  }

  return (
    <div className={styles.container}>
      <Navigation />
      <main className={styles.main}>
        <div className={styles.content}>
          <h1 className={styles.title}>SPACE INVADERS</h1>
          <div className={styles.subtitle}>Welcome to the Classic Arcade Experience</div>

          {/* Conditional rendering based on showWelcome state */}
          {!showWelcome ? (
            <div className={styles.formContainer}>
              <h2 className={styles.formTitle}>Enter Your Name to Begin</h2>
              <form onSubmit={handleNameSubmit} className={styles.form}>
                <input
                  type="text"
                  value={userName}
                  onChange={handleNameChange}
                  placeholder="Enter your name..."
                  className={styles.input}
                  maxLength={20}
                />
                <button type="submit" className={styles.button}>
                  START ADVENTURE
                </button>
              </form>
            </div>
          ) : (
            <WelcomeMessage userName={userName} />
          )}

          <div className={styles.features}>
            <div className={styles.featureCard}>
              <h3 className={styles.featureTitle}>🎮 Classic Gameplay</h3>
              <p className={styles.featureText}>Experience the original Space Invaders with modern React technology</p>
            </div>
            <div className={styles.featureCard}>
              <h3 className={styles.featureTitle}>🏆 High Scores</h3>
              <p className={styles.featureText}>Compete for the highest score and track your progress</p>
            </div>
            <div className={styles.featureCard}>
              <h3 className={styles.featureTitle}>⚡ Progressive Difficulty</h3>
              <p className={styles.featureText}>Each wave gets faster and more challenging</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
