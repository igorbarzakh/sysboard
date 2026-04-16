import styles from "./BoardListSkeleton.module.scss";

type BoardListSkeletonProps = {
  view: "grid" | "list";
};

export function BoardListSkeleton({ view }: BoardListSkeletonProps) {
  const skeletonLength = view === "grid" ? 15 : 10;
  const items = Array.from({ length: skeletonLength }, (_, index) => index);

  if (view === "grid") {
    return (
      <div className={styles.root}>
        <div className={styles.grid}>
          {items.map((item) => (
            <SkeletonCard key={item} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {items.map((item) => (
        <SkeletonRow key={item} />
      ))}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className={styles.skeletonCard}>
      <div className={styles.skeletonCardPreview} />
      <div className={styles.skeletonCardBody}>
        <div className={[styles.skeletonLine, styles.cardTitleLine].join(" ")} />
        <div className={[styles.skeletonLine, styles.cardMetaLine].join(" ")} />
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className={styles.skeletonRow}>
      <div className={styles.skeletonRowCell}>
        <div className={styles.skeletonRowThumb} />
        <div className={[styles.skeletonLine, styles.rowNameLine].join(" ")} />
      </div>
      <div className={[styles.skeletonLine, styles.rowMetaLine].join(" ")} />
      <div className={[styles.skeletonLine, styles.rowMetaLine].join(" ")} />
      <div />
    </div>
  );
}
