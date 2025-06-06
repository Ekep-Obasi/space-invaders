"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import styles from "./space-invaders-game.module.css";
import GameOverScreen from "../game-over-screen/game-over-screen";
import StartScreen from '../start-screen/start-screen';

// Game constants
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PLAYER_WIDTH = 60;
const PLAYER_HEIGHT = 30;
const ENEMY_WIDTH = 40;
const ENEMY_HEIGHT = 30;
const ENEMY_ROWS = 5;
const ENEMY_COLS = 8;
const ENEMY_PADDING = 20;
const BULLET_WIDTH = 4;
const BULLET_HEIGHT = 15;
const BASE_PLAYER_SPEED = 8;
const BASE_ENEMY_SPEED = 1;
const BASE_BULLET_SPEED = 10;
const ENEMY_DESCENT_RATE = 20;
const ENEMY_POINTS = 100;

export default function SpaceInvadersGame() {
  const canvasRef = useRef(null);

  // Component state management
  const [gameState, setGameState] = useState({
    score: 0,
    wave: 1,
    lives: 3,
    gameStarted: false,
    gameOver: false,
    paused: false,
  });

  // Game entity refs
  const playerRef = useRef({
    x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2,
    y: CANVAS_HEIGHT - PLAYER_HEIGHT - 20,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    speed: BASE_PLAYER_SPEED,
  });

  const enemiesRef = useRef([]);
  const bulletsRef = useRef([]);
  const keysRef = useRef({});
  const enemyDirectionRef = useRef(1);
  const lastTimeRef = useRef(0);
  const animationFrameRef = useRef(0);
  const gameStateRef = useRef(gameState);

  // Update game state ref whenever state changes
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Calculate difficulty multiplier based on wave
  const getDifficultyMultiplier = (wave) => {
    return 1 + (wave - 1) * 0.3; // Increase speed by 30% each wave
  };

  // Initialize game entities
  const initGameEntities = () => {
    // Reset player position
    playerRef.current = {
      x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2,
      y: CANVAS_HEIGHT - PLAYER_HEIGHT - 20,
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT,
      speed: BASE_PLAYER_SPEED,
    };

    // Create enemies grid
    const enemies = [];
    for (let row = 0; row < ENEMY_ROWS; row++) {
      for (let col = 0; col < ENEMY_COLS; col++) {
        enemies.push({
          x: col * (ENEMY_WIDTH + ENEMY_PADDING) + 100,
          y: row * (ENEMY_HEIGHT + ENEMY_PADDING) + 50,
          width: ENEMY_WIDTH,
          height: ENEMY_HEIGHT,
          alive: true,
        });
      }
    }
    enemiesRef.current = enemies;
    bulletsRef.current = [];
    enemyDirectionRef.current = 1;
  };

  // Start new game
  const handleStartGame = () => {
    initGameEntities();
    setGameState({
      score: 0,
      wave: 1,
      lives: 3,
      gameStarted: true,
      gameOver: false,
      paused: false,
    });
    lastTimeRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  };

  // Restart game
  const handleRestartGame = () => {
    handleStartGame();
  };

  // Pause/Resume game
  const handleTogglePause = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      paused: !prev.paused,
    }));
  }, []);

  // Save high score to localStorage
  const saveHighScore = (score, wave) => {
    const playerName =
      prompt("Enter your name for the high score:") || "Anonymous";
    const newScore = {
      id: Date.now(),
      name: playerName,
      score: score,
      wave: wave,
      date: new Date().toLocaleDateString(),
    };

    const existingScores = JSON.parse(
      localStorage.getItem("spaceInvadersHighScores") || "[]"
    );
    const updatedScores = [...existingScores, newScore]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10); // Keep only top 10

    localStorage.setItem(
      "spaceInvadersHighScores",
      JSON.stringify(updatedScores)
    );
  };

  // Game loop
  const gameLoop = (timestamp) => {
    const currentGameState = gameStateRef.current;
    if (currentGameState.gameOver || currentGameState.paused) return;

    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    update(deltaTime);
    render();

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  };

  // Update game logic
  const update = (deltaTime) => {
    const player = playerRef.current;
    const keys = keysRef.current;
    const bullets = bulletsRef.current;
    const enemies = enemiesRef.current;
    const currentGameState = gameStateRef.current;
    const difficultyMultiplier = getDifficultyMultiplier(currentGameState.wave);

    // Player movement
    if (keys["ArrowLeft"] && player.x > 0) {
      player.x -= player.speed;
    }
    if (keys["ArrowRight"] && player.x < CANVAS_WIDTH - player.width) {
      player.x += player.speed;
    }

    // Update bullets
    bullets.forEach((bullet) => {
      if (bullet.active) {
        bullet.y -= BASE_BULLET_SPEED * difficultyMultiplier;

        if (bullet.y < 0) {
          bullet.active = false;
        }

        // Check collisions with enemies
        enemies.forEach((enemy) => {
          if (enemy.alive && checkCollision(bullet, enemy)) {
            bullet.active = false;
            enemy.alive = false;
            setGameState((prev) => ({
              ...prev,
              score: prev.score + ENEMY_POINTS,
            }));
          }
        });
      }
    });

    // Clean up inactive bullets
    bulletsRef.current = bullets.filter((bullet) => bullet.active);

    // Update enemy movement
    let shouldChangeDirection = false;
    let lowestEnemy = 0;

    enemies.forEach((enemy) => {
      if (!enemy.alive) return;

      enemy.x +=
        BASE_ENEMY_SPEED * difficultyMultiplier * enemyDirectionRef.current;

      if (
        (enemyDirectionRef.current > 0 &&
          enemy.x + enemy.width > CANVAS_WIDTH) ||
        (enemyDirectionRef.current < 0 && enemy.x < 0)
      ) {
        shouldChangeDirection = true;
      }

      if (enemy.y + enemy.height > lowestEnemy) {
        lowestEnemy = enemy.y + enemy.height;
      }

      // Check collision with player
      if (enemy.alive && checkCollision(enemy, player)) {
        setGameState((prev) => {
          const newLives = prev.lives - 1;
          if (newLives <= 0) {
            saveHighScore(prev.score, prev.wave);
            return { ...prev, lives: 0, gameOver: true };
          }
          return { ...prev, lives: newLives };
        });
      }
    });

    // Change direction and move enemies down
    if (shouldChangeDirection) {
      enemyDirectionRef.current *= -1;
      enemies.forEach((enemy) => {
        if (enemy.alive) {
          enemy.y += ENEMY_DESCENT_RATE;
        }
      });
    }

    // Check if enemies reached the bottom
    if (lowestEnemy >= player.y) {
      setGameState((prev) => {
        saveHighScore(prev.score, prev.wave);
        return { ...prev, gameOver: true };
      });
    }

    // Check if all enemies are defeated
    if (enemies.every((enemy) => !enemy.alive)) {
      setGameState((prev) => ({
        ...prev,
        wave: prev.wave + 1,
      }));
      initGameEntities();
    }
  };

  // Render game
  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const currentGameState = gameStateRef.current;

    // Clear canvas
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw player
    const player = playerRef.current;
    ctx.fillStyle = "#00ff00";
    drawEntity(ctx, player);

    // Draw enemies
    const enemies = enemiesRef.current;
    ctx.fillStyle = "#ff0000";
    enemies.forEach((enemy) => {
      if (enemy.alive) {
        drawEntity(ctx, enemy);
      }
    });

    // Draw bullets
    const bullets = bulletsRef.current;
    ctx.fillStyle = "#ffff00";
    bullets.forEach((bullet) => {
      if (bullet.active) {
        drawEntity(ctx, bullet);
      }
    });

    // Draw UI
    ctx.fillStyle = "#ffffff";
    ctx.font = "16px 'Press Start 2P', monospace";
    ctx.textAlign = "left";
    ctx.fillText(`SCORE: ${currentGameState.score}`, 20, 30);
    ctx.fillText(`WAVE: ${currentGameState.wave}`, 20, 55);
    ctx.fillText(`LIVES: ${currentGameState.lives}`, 20, 80);

    // Draw pause indicator
    if (currentGameState.paused) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = "#ffffff";
      ctx.font = "32px 'Press Start 2P', monospace";
      ctx.textAlign = "center";
      ctx.fillText("PAUSED", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    }
  };

  // Helper to draw entities
  const drawEntity = (ctx, entity) => {
    ctx.fillRect(entity.x, entity.y, entity.width, entity.height);
  };

  // Check collision between two entities
  const checkCollision = (a, b) => {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  };

  // Shoot bullet
  const shoot = useCallback(() => {
    const player = playerRef.current;
    const bullets = bulletsRef.current;

    if (bullets.length < 5) {
      bullets.push({
        x: player.x + player.width / 2 - BULLET_WIDTH / 2,
        y: player.y,
        width: BULLET_WIDTH,
        height: BULLET_HEIGHT,
        active: true,
      });
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevent default behavior for game keys
      if (
        e.key === " " ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight" ||
        e.key === "p" ||
        e.key === "P"
      ) {
        e.preventDefault();
      }

      keysRef.current[e.key] = true;

      const currentGameState = gameStateRef.current;

      // Handle spacebar ONLY for shooting
      if (
        e.key === " " &&
        currentGameState.gameStarted &&
        !currentGameState.gameOver &&
        !currentGameState.paused
      ) {
        shoot();
        return;
      }

      // Handle P key ONLY for pausing
      if (
        (e.key === "p" || e.key === "P") &&
        currentGameState.gameStarted &&
        !currentGameState.gameOver
      ) {
        handleTogglePause();
        return;
      }
    };

    const handleKeyUp = (e) => {
      keysRef.current[e.key] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [shoot, handleTogglePause]);

  // Start game loop when game starts
  useEffect(() => {
    if (gameState.gameStarted && !gameState.gameOver && !gameState.paused) {
      lastTimeRef.current = performance.now();
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [gameState.gameStarted, gameState.gameOver, gameState.paused]);

  return (
    <div className={styles.container}>
      <div className={styles.gameContainer}>
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className={styles.canvas}
        />

        {/* Conditional rendering based on game state */}
        {!gameState.gameStarted && (
          <StartScreen onStartGame={handleStartGame} />
        )}

        {gameState.gameOver && (
          <GameOverScreen
            score={gameState.score}
            wave={gameState.wave}
            onRestart={handleRestartGame}
          />
        )}
      </div>

      {/* Game controls */}
      {gameState.gameStarted && !gameState.gameOver && (
        <div className={styles.controls}>
          <p>Arrow Keys: Move | Spacebar: Shoot | P: Pause</p>
          <button onClick={handleTogglePause} className={styles.pauseButton}>
            {gameState.paused ? "RESUME" : "PAUSE"}
          </button>
        </div>
      )}
    </div>
  );
}
