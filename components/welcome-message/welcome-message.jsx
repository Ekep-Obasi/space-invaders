"use client"

import Link from "next/link"
import styles from "./welcome-message.module.css"

export default function WelcomeMessage({ userName }) {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Welcome, Commander {userName}!</h2>
      <p className={styles.description}>
        The galaxy is under attack! Alien invaders are descending from space, and you are our last hope. Use your
        spaceship to defend Earth and achieve the highest score possible.
      </p>
      <div className={styles.content}>
        <div className={styles.briefing}>
          <h3 className={styles.briefingTitle}>Mission Briefing:</h3>
          <ul className={styles.briefingList}>
            <li>• Use arrow keys to move your spaceship</li>
            <li>• Press spacebar to fire at the invaders</li>
            <li>• Each enemy destroyed earns 100 points</li>
            <li>• Survive as long as possible!</li>
          </ul>
        </div>
        <Link href="/game" className={styles.button}>
          BEGIN MISSION
        </Link>
      </div>
    </div>
  )
}
