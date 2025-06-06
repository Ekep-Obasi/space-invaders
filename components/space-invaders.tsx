"use client"

import { useEffect, useRef, useState } from "react"
import GameOverScreen from "@/components/game-over-screen/game-over-screen"

// Game constants
const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 600
const PLAYER_WIDTH = 60
const PLAYER_HEIGHT = 30
const ENEMY_WIDTH = 40
const ENEMY_HEIGHT = 30
const ENEMY_ROWS = 5
const ENEMY_COLS = 8
const ENEMY_PADDING = 20
const BULLET_WIDTH = 4
const BULLET_HEIGHT = 15
const PLAYER_SPEED = 8
const ENEMY_SPEED = 1
const BULLET_SPEED = 10
const ENEMY_DESCENT_RATE = 20
const ENEMY_POINTS = 100

// Game entities
interface Entity {
  x: number
  y: number
  width: number
  height: number
}

interface Player extends Entity {
  speed: number
}

interface Enemy extends Entity {
  alive: boolean
}

interface Bullet extends Entity {
  active: boolean
}

export default function SpaceInvaders() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const playerRef = useRef<Player>({
    x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2,
    y: CANVAS_HEIGHT - PLAYER_HEIGHT - 20,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    speed: PLAYER_SPEED,
  })

  const enemiesRef = useRef<Enemy[]>([])
  const bulletsRef = useRef<Bullet[]>([])
  const keysRef = useRef<{ [key: string]: boolean }>({})
  const enemyDirectionRef = useRef<number>(1)
  const lastTimeRef = useRef<number>(0)
  const scoreRef = useRef<number>(0)
  const gameOverRef = useRef<boolean>(false)
  const animationFrameRef = useRef<number>(0)

  // Initialize game
  const initGame = () => {
    // Reset game state
    playerRef.current = {
      x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2,
      y: CANVAS_HEIGHT - PLAYER_HEIGHT - 20,
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT,
      speed: PLAYER_SPEED,
    }

    // Create enemies grid
    const enemies: Enemy[] = []
    for (let row = 0; row < ENEMY_ROWS; row++) {
      for (let col = 0; col < ENEMY_COLS; col++) {
        enemies.push({
          x: col * (ENEMY_WIDTH + ENEMY_PADDING) + 100,
          y: row * (ENEMY_HEIGHT + ENEMY_PADDING) + 50,
          width: ENEMY_WIDTH,
          height: ENEMY_HEIGHT,
          alive: true,
        })
      }
    }
    enemiesRef.current = enemies
    bulletsRef.current = []
    enemyDirectionRef.current = 1
    scoreRef.current = 0
    setScore(0)
    gameOverRef.current = false
    setGameOver(false)
  }

  // Initialize and start game
  const startGame = () => {
    initGame()
    lastTimeRef.current = performance.now()
    animationFrameRef.current = requestAnimationFrame(gameLoop)
  }

  // Restart game
  const restartGame = () => {
    initGame()
    setGameOver(false)
    lastTimeRef.current = performance.now()
    animationFrameRef.current = requestAnimationFrame(gameLoop)
  }

  // Game loop
  const gameLoop = (timestamp: number) => {
    if (gameOverRef.current) return

    const deltaTime = timestamp - lastTimeRef.current
    lastTimeRef.current = timestamp

    update(deltaTime)
    render()

    animationFrameRef.current = requestAnimationFrame(gameLoop)
  }

  // Update game state
  const update = (deltaTime: number) => {
    const player = playerRef.current
    const keys = keysRef.current
    const bullets = bulletsRef.current
    const enemies = enemiesRef.current

    // Player movement
    if (keys["ArrowLeft"] && player.x > 0) {
      player.x -= player.speed
    }
    if (keys["ArrowRight"] && player.x < CANVAS_WIDTH - player.width) {
      player.x += player.speed
    }

    // Update bullets
    bullets.forEach((bullet) => {
      if (bullet.active) {
        bullet.y -= BULLET_SPEED

        // Remove bullets that go off screen
        if (bullet.y < 0) {
          bullet.active = false
        }

        // Check for collisions with enemies
        enemies.forEach((enemy) => {
          if (enemy.alive && checkCollision(bullet, enemy)) {
            bullet.active = false
            enemy.alive = false
            scoreRef.current += ENEMY_POINTS
            setScore(scoreRef.current)
          }
        })
      }
    })

    // Clean up inactive bullets
    bulletsRef.current = bullets.filter((bullet) => bullet.active)

    // Update enemy movement
    let shouldChangeDirection = false
    let lowestEnemy = 0

    enemies.forEach((enemy) => {
      if (!enemy.alive) return

      enemy.x += ENEMY_SPEED * enemyDirectionRef.current

      // Check if any enemy hits the edge
      if (
        (enemyDirectionRef.current > 0 && enemy.x + enemy.width > CANVAS_WIDTH) ||
        (enemyDirectionRef.current < 0 && enemy.x < 0)
      ) {
        shouldChangeDirection = true
      }

      // Track lowest enemy
      if (enemy.y + enemy.height > lowestEnemy) {
        lowestEnemy = enemy.y + enemy.height
      }

      // Check collision with player
      if (enemy.alive && checkCollision(enemy, player)) {
        gameOverRef.current = true
        setGameOver(true)
      }
    })

    // Change direction and move enemies down
    if (shouldChangeDirection) {
      enemyDirectionRef.current *= -1
      enemies.forEach((enemy) => {
        if (enemy.alive) {
          enemy.y += ENEMY_DESCENT_RATE
        }
      })
    }

    // Check if enemies reached the bottom
    if (lowestEnemy >= player.y) {
      gameOverRef.current = true
      setGameOver(true)
    }

    // Check if all enemies are defeated
    if (enemies.every((enemy) => !enemy.alive)) {
      // Create a new wave with increased speed
      initGame()
    }
  }

  // Render game
  const render = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Draw player
    const player = playerRef.current
    ctx.fillStyle = "#00ff00" // Neon green
    drawEntity(ctx, player)

    // Draw enemies
    const enemies = enemiesRef.current
    ctx.fillStyle = "#ff0000" // Neon red
    enemies.forEach((enemy) => {
      if (enemy.alive) {
        drawEntity(ctx, enemy)
      }
    })

    // Draw bullets
    const bullets = bulletsRef.current
    ctx.fillStyle = "#ffff00" // Neon yellow
    bullets.forEach((bullet) => {
      if (bullet.active) {
        drawEntity(ctx, bullet)
      }
    })

    // Draw score
    ctx.fillStyle = "#ffffff"
    ctx.font = "20px 'Press Start 2P', monospace"
    ctx.textAlign = "left"
    ctx.fillText(`SCORE: ${scoreRef.current}`, 20, 30)
  }

  // Helper to draw entities
  const drawEntity = (ctx: CanvasRenderingContext2D, entity: Entity) => {
    ctx.fillRect(entity.x, entity.y, entity.width, entity.height)
  }

  // Check collision between two entities
  const checkCollision = (a: Entity, b: Entity) => {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y
  }

  // Shoot bullet
  const shoot = () => {
    const player = playerRef.current
    const bullets = bulletsRef.current

    // Limit number of bullets on screen
    if (bullets.length < 5) {
      bullets.push({
        x: player.x + player.width / 2 - BULLET_WIDTH / 2,
        y: player.y,
        width: BULLET_WIDTH,
        height: BULLET_HEIGHT,
        active: true,
      })
    }
  }

  // Set up event listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key] = true

      // Shoot on spacebar
      if (e.key === " " && !gameOverRef.current) {
        shoot()
        e.preventDefault() // Prevent page scrolling
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key] = false
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    // Start game immediately
    startGame()

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
      cancelAnimationFrame(animationFrameRef.current)
    }
  }, [])

  return (
    <div className="relative">
      <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="border-2 border-green-500" />
      {gameOver && <GameOverScreen score={score} onRestart={restartGame}/>}
    </div>
  )
}
