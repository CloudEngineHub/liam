import { useTableSelection } from '@/features/erd/hooks'
import type { TableNodeType } from '@/features/erd/types'
import { selectTableLogEvent } from '@/features/gtm/utils'
import { useVersion } from '@/providers'
import { updateActiveNodeIds, useUserEditingStore } from '@/stores'
import { Eye, SidebarMenuButton, SidebarMenuItem, Table2 } from '@liam-hq/ui'
import clsx from 'clsx'
import { ContextMenu } from 'radix-ui'
import {
  type FC,
  type KeyboardEvent,
  type MouseEvent,
  type MouseEventHandler,
  useEffect,
  useRef,
  useState,
} from 'react'
import styles from './TableNameMenuButton.module.css'
import { VisibilityButton } from './VisibilityButton'

type Props = {
  node: TableNodeType
  showSelectedTables: MouseEventHandler<HTMLDivElement>
}

export const TableNameMenuButton: FC<Props> = ({
  node,
  showSelectedTables,
}) => {
  const name = node.data.table.name

  const { selectTable } = useTableSelection()
  const { activeNodeIds } = useUserEditingStore()
  const textRef = useRef<HTMLSpanElement>(null)
  const [isTruncated, setIsTruncated] = useState<boolean>(false)

  useEffect(() => {
    const checkTruncation = () => {
      if (textRef.current) {
        const element = textRef.current
        const isTruncated = element.scrollWidth > element.clientWidth
        setIsTruncated(isTruncated)
      }
    }

    // Initial check after a small delay to ensure DOM is rendered
    const timeoutId = setTimeout(checkTruncation, 0)

    // Check on window resize and when sidebar width changes
    window.addEventListener('resize', checkTruncation)

    // Add a mutation observer to watch for width changes
    const observer = new ResizeObserver(checkTruncation)
    if (textRef.current) {
      observer.observe(textRef.current)
    }

    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('resize', checkTruncation)
      observer.disconnect()
    }
  }, [])

  // TODO: Move handleClickMenuButton outside of TableNameMenuButton
  // after logging is complete
  const { version } = useVersion()
  const handleClickMenuButton =
    (tableId: string) => (event: MouseEvent | KeyboardEvent) => {
      event.preventDefault()

      const isMultiSelect = event.ctrlKey || event.metaKey
      updateActiveNodeIds(tableId, isMultiSelect)

      selectTable({
        tableId,
        displayArea: 'main',
      })

      selectTableLogEvent({
        ref: 'leftPane',
        tableId,
        platform: version.displayedOn,
        gitHash: version.gitHash,
        ver: version.version,
        appEnv: version.envName,
      })
    }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        className={clsx(
          styles.button,
          activeNodeIds.has(name) && styles.active,
        )}
        asChild
        tooltip={name}
        showtooltip={isTruncated}
      >
        <div
          // biome-ignore lint/a11y/useSemanticElements: Implemented with div button to be button in button
          role="button"
          tabIndex={0}
          onClick={handleClickMenuButton(name)}
          onKeyDown={handleClickMenuButton(name)}
          aria-label={`Menu button for ${name}`}
        >
          <ContextMenu.Root>
            <ContextMenu.Trigger className={clsx(styles.contextMenuTrigger)}>
              <Table2 size="10px" />

              <span ref={textRef} className={styles.tableName}>
                {name}
              </span>

              <VisibilityButton tableName={name} hidden={node.hidden} />
            </ContextMenu.Trigger>
            <ContextMenu.Portal>
              <ContextMenu.Content className={clsx(styles.contextMenuCotent)}>
                <ContextMenu.Item
                  className={clsx(styles.contextMenuItem)}
                  onClick={(event: MouseEvent<HTMLDivElement>) => {
                    event.stopPropagation()
                    showSelectedTables(event)
                  }}
                >
                  <Eye className={styles.icon} />
                  <span>Show Only Selected Layers</span>
                </ContextMenu.Item>
              </ContextMenu.Content>
            </ContextMenu.Portal>
          </ContextMenu.Root>
        </div>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
