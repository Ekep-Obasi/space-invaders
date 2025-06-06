"use client"

import styles from "./page.module.css"
import Navigation from "@/components/navigation/navigation"
import SpaceInvadersGame from "../../components/space-invaders-game/space-invaders-game"

export default function GamePage() {
  return (
    <div className={styles.container}>
      <Navigation />
      <main className={styles.main}>
        <SpaceInvadersGame />
      </main>
    </div>
  )
}
