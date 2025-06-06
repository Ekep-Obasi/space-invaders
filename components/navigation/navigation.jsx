"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import styles from "./navigation.module.css"

export default function Navigation() {
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/game", label: "Play Game" },
    { href: "/highscores", label: "High Scores" },
  ]

  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.logo}>SPACE INVADERS</div>
          <div className={styles.links}>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={pathname === item.href ? styles.activeLink : styles.link}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
