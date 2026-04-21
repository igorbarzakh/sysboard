'use client'

import { useState } from 'react'
import { AuthModal } from '@features/auth-modal/ui'
import { RootHeader } from '@widgets/root-header/ui'
import { Button } from '@shared/ui'
import styles from './HomePage.module.scss'

export function HomePage() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <AuthModal open={modalOpen} onClose={() => setModalOpen(false)} />

      <section className={styles.page}>
        <RootHeader onSignInClick={() => setModalOpen(true)} />
        <div
          aria-hidden="true"
          className={[styles.glow, styles.glowPrimary].join(' ')}
        />
        <div
          aria-hidden="true"
          className={[styles.glow, styles.glowSecondary].join(' ')}
        />
        <div
          aria-hidden="true"
          className={[styles.glow, styles.glowTertiary].join(' ')}
        />

        <div className={styles.content}>
          <h1 className={styles.title}>
            Design systems
            <br />
            <span className={styles.titleAccentWrap}>
              <span className={styles.titleAccent}>together</span>

              <span className={styles.selectionMark} />

              <span className={styles.cursorLabel}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M2 1l9 5.5-4.5 1.4L5 13z"
                    fill="#2EC98A"
                    stroke="white"
                    strokeWidth="0.8"
                  />
                </svg>
                <span className={styles.cursorName}>Alex</span>
              </span>
            </span>
          </h1>

          <p className={styles.subtitle}>
            A&nbsp;shared canvas for software architects. Draw, connect,
            and&nbsp;collaborate in&nbsp;real&nbsp;time.
          </p>

          <div className={styles.actions}>
            <Button size="lg" onClick={() => setModalOpen(true)}>
              Get started
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
