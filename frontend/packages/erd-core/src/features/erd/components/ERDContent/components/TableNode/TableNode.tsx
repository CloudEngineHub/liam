import type { TableNodeType } from '@/features/erd/types'
import { useUserEditingStore } from '@/stores'
import {
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
} from '@liam-hq/ui'
import type { NodeProps } from '@xyflow/react'
import clsx from 'clsx'
import { type FC, useEffect, useRef, useState } from 'react'
import { TableColumnList } from './TableColumnList'
import { TableHeader } from './TableHeader'
import styles from './TableNode.module.css'

type Props = NodeProps<TableNodeType>

/**
 * Copies relevant computed styles from a source element to a target element.
 */
const copyTextStyles = (source: CSSStyleDeclaration, target: HTMLElement) => {
  const styleProps = [
    'font',
    'fontSize',
    'fontFamily',
    'fontWeight',
    'letterSpacing',
    'wordSpacing',
    'fontStyle',
    'fontVariant',
    'fontStretch',
    'textTransform',
    'textRendering',
    'padding',
    'margin',
    'whiteSpace',
  ] as const

  styleProps.forEach((prop) => {
    target.style[prop] = source[prop]
  })
}

export const TableNode: FC<Props> = ({ data }) => {
  const { showMode: _showMode } = useUserEditingStore()
  const showMode = data.showMode ?? _showMode
  const name = data?.table?.name

  const textRef = useRef<HTMLSpanElement>(null)
  const [isTruncated, setIsTruncated] = useState<boolean>(false)

  useEffect(() => {
    const checkTruncation = () => {
      if (!textRef.current || !name) return
      const element = textRef.current
      const style = window.getComputedStyle(element)

      // Create a hidden span for measurement
      const tempSpan = document.createElement('span')
      tempSpan.textContent = name
      tempSpan.style.visibility = 'hidden'
      tempSpan.style.position = 'absolute'
      tempSpan.style.pointerEvents = 'none'
      tempSpan.style.whiteSpace = 'nowrap'
      copyTextStyles(style, tempSpan)

      document.body.appendChild(tempSpan)
      try {
        const textWidth = tempSpan.offsetWidth
        const availableWidth = element.clientWidth
        setIsTruncated(textWidth > availableWidth)
      } finally {
        document.body.removeChild(tempSpan)
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
  }, [name])

  return (
    <TooltipProvider>
      <TooltipRoot>
        <TooltipTrigger asChild>
          <div
            className={clsx(
              styles.wrapper,
              data.isHighlighted && styles.wrapperHighlighted,
              data.isActiveHighlighted && styles.wrapperActive,
            )}
            data-erd={
              (data.isHighlighted || data.isActiveHighlighted) &&
              'table-node-highlighted'
            }
          >
            <TableHeader data={data} textRef={textRef} />
            {showMode === 'ALL_FIELDS' && <TableColumnList data={data} />}
            {showMode === 'KEY_ONLY' && (
              <TableColumnList data={data} filter="KEY_ONLY" />
            )}
          </div>
        </TooltipTrigger>

        <TooltipPortal>
          <TooltipContent side={'top'} sideOffset={4} hidden={!isTruncated}>
            {name}
          </TooltipContent>
        </TooltipPortal>
      </TooltipRoot>
    </TooltipProvider>
  )
}
