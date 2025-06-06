"use client"

import styles from "./start-screen.module.css"

export default function StartScreen({ onStartGame }) {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>SPACE INVADERS</h2>
      <div className={styles.content}>
        <p className={styles.subtitle}>Defend Earth from alien invasion!</p>
        <div className={styles.features}>
          <p>🎯 Destroy all enemies to advance waves</p>
          <p>⚡ Each wave increases difficulty</p>
          <p>🏆 Earn 100 points per enemy</p>
          <p>❤️ You have 3 lives</p>
        </div>
      </div>
      <div className={styles.controls}>
        <p>
          <strong>Controls:</strong>
        </p>
        <p>← → Arrow Keys: Move</p>
        <p>Spacebar: Shoot</p>
        <p>P: Pause Game</p>
      </div>
      <button onClick={onStartGame} className={styles.button}>
        START GAME
      </button>
    </div>
  )
}
