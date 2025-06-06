"use client"

import Link from "next/link"
import styles from "./game-over-screen.module.css"

export default function GameOverScreen({ score, wave = 1, onRestart }) {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>GAME OVER</h2>
      <div className={styles.stats}>
        <p className={styles.score}>FINAL SCORE: {score.toLocaleString()}</p>
        <p className={styles.wave}>WAVES COMPLETED: {wave - 1}</p>
        <div className={styles.achievement}>
          {score >= 5000 && <p className={styles.excellent}>🏆 Excellent Score!</p>}
          {score >= 2000 && score < 5000 && <p className={styles.great}>⭐ Great Job!</p>}
          {score < 2000 && <p className={styles.good}>Keep practicing, Commander!</p>}
        </div>
      </div>
      <div className={styles.buttons}>
        <button onClick={onRestart} className={styles.restartButton}>
          PLAY AGAIN
        </button>
        <Link href="/highscores" className={styles.highScoresButton}>
          VIEW HIGH SCORES
        </Link>
        <Link href="/" className={styles.menuButton}>
          MAIN MENU
        </Link>
      </div>
    </div>
  )
}
