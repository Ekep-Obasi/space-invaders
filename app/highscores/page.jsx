"use client"

import styles from "./page.module.css"
import Navigation from "@/components/navigation/navigation"
import HighScoresList from "@/components/high-score-list/high-scores-list"

export default function HighScoresPage() {
  return (
    <div className={styles.container}>
      <Navigation />
      <main className={styles.main}>
        <div className={styles.content}>
          <h1 className={styles.title}>HIGH SCORES</h1>
          <HighScoresList />
        </div>
      </main>
    </div>
  )
}
