import styles from './BoardListSkeleton.module.scss'

export function SkeletonCard() {
  return (
    <div className={styles.skeletonCard}>
      <div className={styles.skeletonCardPreview} />
      <div className={styles.skeletonCardBody}>
        <div className={[styles.skeletonLine, styles.cardTitleLine].join(' ')} />
        <div className={[styles.skeletonLine, styles.cardMetaLine].join(' ')} />
      </div>
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div className={styles.skeletonRow}>
      <div className={styles.skeletonRowCell}>
        <div className={styles.skeletonRowThumb} />
        <div className={[styles.skeletonLine, styles.rowNameLine].join(' ')} />
      </div>
      <div className={[styles.skeletonLine, styles.rowMetaLine].join(' ')} />
      <div className={[styles.skeletonLine, styles.rowMetaLine].join(' ')} />
      <div />
    </div>
  )
}
