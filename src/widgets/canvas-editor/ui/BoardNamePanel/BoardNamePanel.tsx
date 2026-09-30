import { useEffect } from 'react'
import Link from 'next/link'
import { House, Layers2 } from 'lucide-react'
import { DefaultPageMenu, useEditor } from 'tldraw'
import styles from './BoardNamePanel.module.scss'

interface BoardNamePanelProps {
  name: string
  workspaceSlug: string
}

export function BoardNamePanel({ name, workspaceSlug }: BoardNamePanelProps) {
  const editor = useEditor()

  useEffect(() => {
    const closeOnPageClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return

      const button = event.target.closest(
        '.tlui-page-menu__item > .tlui-page-menu__item__button',
      )
      if (button && editor.getContainer().contains(button)) {
        editor.menus.clearOpenMenus()
      }
    }

    document.addEventListener('click', closeOnPageClick)
    return () => document.removeEventListener('click', closeOnPageClick)
  }, [editor])

  return (
    <nav className={styles.panel} aria-label="Board navigation">
      <Link
        className={styles.home}
        href={`/workspace/${workspaceSlug}`}
        aria-label="Go to workspace"
        title="Go to workspace"
      >
        <House size={20} aria-hidden="true" />
      </Link>
      <span className={styles.name} title={name}>{name}</span>
      <div className={styles.pages}>
        <Layers2 size={20} aria-hidden="true" />
        <DefaultPageMenu />
      </div>
    </nav>
  )
}
