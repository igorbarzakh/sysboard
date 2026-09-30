import { CornerUpRight, MoveUpRight } from 'lucide-react'
import {
  ArrowShapeKindStyle,
  TldrawUiPopover,
  TldrawUiPopoverContent,
  TldrawUiPopoverTrigger,
  TldrawUiToolbar,
  TldrawUiToolbarButton,
  useEditor,
  useReadonly,
  useTools,
  useTranslation,
  useValue,
} from 'tldraw'
import styles from './ArrowMenu.module.scss'

const arrowKinds = [
  { value: 'arc', icon: MoveUpRight },
  { value: 'elbow', icon: CornerUpRight },
] as const

export function ArrowMenu() {
  const editor = useEditor()
  const tools = useTools()
  const msg = useTranslation()
  const isReadonly = useReadonly()
  const { isSelected, kind } = useValue('arrow options', () => ({
    isSelected: editor.getCurrentToolId() === 'arrow',
    kind: editor.getStyleForNextShape(ArrowShapeKindStyle),
  }), [editor])

  if (isReadonly) return null

  return (
    <TldrawUiPopover id="board arrows">
      <TldrawUiPopoverTrigger>
        <TldrawUiToolbarButton
          type="tool"
          title={msg('tool.arrow')}
          aria-pressed={isSelected}
          data-testid="tools.arrow"
          onClick={() => tools.arrow.onSelect('toolbar')}
        >
          <MoveUpRight size={20} aria-hidden="true" />
        </TldrawUiToolbarButton>
      </TldrawUiPopoverTrigger>
      <TldrawUiPopoverContent side="top" sideOffset={12}>
        <TldrawUiToolbar className={styles.panel} label={msg('style-panel.arrow-kind')}>
          {arrowKinds.map(({ value, icon: Icon }) => (
            <TldrawUiToolbarButton
              key={value}
              type="tool"
              className={styles.button}
              title={msg(`arrow-kind-style.${value}`)}
              aria-pressed={kind === value}
              onClick={() => editor.setStyleForNextShapes(ArrowShapeKindStyle, value)}
            >
              <Icon size={16} aria-hidden="true" />
            </TldrawUiToolbarButton>
          ))}
        </TldrawUiToolbar>
      </TldrawUiPopoverContent>
    </TldrawUiPopover>
  )
}
