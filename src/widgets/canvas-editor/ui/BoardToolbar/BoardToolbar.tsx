import { Hand, MousePointer2, Shapes, StickyNote, Type, type LucideIcon } from 'lucide-react'
import {
  DefaultToolbar,
  TldrawUiMenuContextProvider,
  TldrawUiMenuItem,
  TldrawUiPopover,
  TldrawUiPopoverContent,
  TldrawUiPopoverTrigger,
  TldrawUiToolbar,
  TldrawUiToolbarButton,
  ToolbarItem,
  useEditor,
  useIsToolSelected,
  useReadonly,
  useTools,
  useTranslation,
  useValue,
} from 'tldraw'
import { DrawingMenu } from '../DrawingMenu/DrawingMenu'
import { ArrowMenu } from '../ArrowMenu/ArrowMenu'
import styles from './BoardToolbar.module.scss'

const primaryTools = [
  { id: 'select', icon: MousePointer2 },
  { id: 'hand', icon: Hand },
  { id: 'draw', icon: null },
  { id: 'arrow', icon: null },
  { id: 'text', icon: Type },
  { id: 'note', icon: StickyNote },
]

const shapeTools = [
  'rectangle', 'ellipse', 'triangle', 'diamond',
  'hexagon', 'oval', 'rhombus', 'star',
  'cloud', 'heart', 'x-box', 'check-box',
  'arrow-left', 'arrow-up', 'arrow-down', 'arrow-right',
  'line', 'laser', 'frame',
]

function PrimaryTool({ id, icon: Icon }: { id: string; icon: LucideIcon }) {
  const tools = useTools()
  const tool = tools[id]
  const isSelected = useIsToolSelected(tool)

  return <TldrawUiMenuItem {...tool} icon={<Icon size={20} />} isSelected={isSelected} />
}

function ShapesMenu() {
  const editor = useEditor()
  const msg = useTranslation()
  const isReadonly = useReadonly()
  const isSelected = useValue('shape tool selected', () => {
    const toolId = editor.getCurrentToolId()
    return toolId === 'geo' || shapeTools.includes(toolId)
  }, [editor])

  if (isReadonly) return null

  return (
    <TldrawUiPopover id="board shapes" className={styles.shapesTrigger}>
      <TldrawUiPopoverTrigger>
        <TldrawUiToolbarButton
          type="tool"
          title={msg('tool-panel.more')}
          aria-pressed={isSelected}
          data-testid="tools.more-button"
        >
          <Shapes size={20} aria-hidden="true" />
        </TldrawUiToolbarButton>
      </TldrawUiPopoverTrigger>
      <TldrawUiPopoverContent side="top">
        <TldrawUiToolbar
          orientation="grid"
          label={msg('tool-panel.more')}
          className={styles.shapesMenu}
          onClick={() => editor.menus.clearOpenMenus()}
        >
          <TldrawUiMenuContextProvider type="toolbar-overflow" sourceId="toolbar">
            {shapeTools.map((tool) => <ToolbarItem key={tool} tool={tool} />)}
          </TldrawUiMenuContextProvider>
        </TldrawUiToolbar>
      </TldrawUiPopoverContent>
    </TldrawUiPopover>
  )
}

export function BoardToolbar() {
  return (
    <div className={styles.root}>
      <DefaultToolbar minItems={7} maxItems={7}>
        {primaryTools.map(({ id, icon }) => icon
          ? <PrimaryTool key={id} id={id} icon={icon} />
          : id === 'draw' ? <DrawingMenu key={id} /> : <ArrowMenu key={id} />)}
        <ShapesMenu />
      </DefaultToolbar>
    </div>
  )
}
