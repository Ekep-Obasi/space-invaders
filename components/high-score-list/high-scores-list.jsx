"use client"

import { useEffect, useState } from "react"
import styles from "./high-scores-list.module.css"

export default function HighScoresList() {
  const [highScores, setHighScores] = useState([])
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  // Load high scores from localStorage on component mount
  useEffect(() => {
    const savedScores = localStorage.getItem("spaceInvadersHighScores")
    if (savedScores) {
      setHighScores(JSON.parse(savedScores))
    }
  }, [])

  // Event handler for clearing high scores
  const handleClearScores = () => {
    localStorage.removeItem("spaceInvadersHighScores")
    setHighScores([])
    setShowClearConfirm(false)
  }

  // Event handler for showing clear confirmation
  const handleShowClearConfirm = () => {
    setShowClearConfirm(true)
  }

  // Event handler for canceling clear action
  const handleCancelClear = () => {
    setShowClearConfirm(false)
  }

  return (
    <div className={styles.container}>
      {/* Conditional rendering based on whether scores exist */}
      {highScores.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyTitle}>No High Scores Yet</div>
          <p className={styles.emptyText}>Play the game to set your first high score!</p>
        </div>
      ) : (
        <div>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead className={styles.tableHead}>
                <tr>
                  <th className={styles.tableHeader}>Rank</th>
                  <th className={styles.tableHeader}>Name</th>
                  <th className={styles.tableHeader}>Score</th>
                  <th className={styles.tableHeader}>Wave</th>
                  <th className={styles.tableHeader}>Date</th>
                </tr>
              </thead>
              <tbody>
                {highScores.map((score, index) => (
                  <tr key={score.id} className={index === 0 ? styles.topScoreRow : styles.scoreRow}>
                    <td className={styles.tableCell}>{index === 0 ? "🏆" : `#${index + 1}`}</td>
                    <td className={styles.tableCell}>{score.name}</td>
                    <td className={styles.tableCell}>{score.score.toLocaleString()}</td>
                    <td className={styles.tableCell}>{score.wave}</td>
                    <td className={styles.tableCell}>{score.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Conditional rendering for clear confirmation */}
          {!showClearConfirm ? (
            <button onClick={handleShowClearConfirm} className={styles.clearButton}>
              Clear All Scores
            </button>
          ) : (
            <div className={styles.confirmContainer}>
              <span className={styles.confirmText}>Are you sure?</span>
              <button onClick={handleClearScores} className={styles.confirmButton}>
                Yes, Clear All
              </button>
              <button onClick={handleCancelClear} className={styles.cancelButton}>
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
