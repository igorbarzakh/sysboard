import styles from './Tooltip.module.scss'

export function TooltipArrow() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="16"
      viewBox="0 0 6 16"
      width="6"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        className={styles.arrowFill}
        d="M6 0h-.5v1.55c0 .55-.27 1.06-.71 1.55-.53.6-1.16 1.05-1.79 1.51-.57.42-1.15.85-1.65 1.37C.87 6.48.5 7.06.5 7.74c0 .68.37 1.26.85 1.77.5.52 1.08.94 1.65 1.36.63.47 1.26.93 1.79 1.51.44.5.71 1 .71 1.56V16H6V0Z"
      />
      <path
        className={styles.arrowBorder}
        clipRule="evenodd"
        d="M6 0v1.55c0 .74-.36 1.36-.85 1.9-1.01 1.13-2.4 1.8-3.44 2.89-.45.47-.71.92-.71 1.4 0 .48.26.93.7 1.4 1.05 1.1 2.44 1.76 3.45 2.89.5.54.85 1.17.85 1.9V16h-.5v-2.06c0-.56-.27-1.06-.71-1.56-1.01-1.12-2.4-1.79-3.44-2.87C.87 9 .5 8.42.5 7.74c0-.68.37-1.26.85-1.76C2.4 4.89 3.78 4.22 4.8 3.1c.44-.5.71-1 .71-1.55V0H6Z"
        fillRule="evenodd"
      />
    </svg>
  )
}
