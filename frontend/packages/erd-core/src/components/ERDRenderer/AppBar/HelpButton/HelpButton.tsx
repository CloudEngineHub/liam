import {
  BookText,
  CircleHelp,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger,
  MessagesSquare,
  TooltipContent,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
} from '@liam-hq/ui'
import { forwardRef } from 'react'
import styles from './HelpButton.module.css'

const handleSelect = (url: string) => () => {
  window.open(url, '_blank', 'noreferrer')
}

export const HelpButton = forwardRef<HTMLButtonElement>((_, ref) => {
  return (
    <DropdownMenuRoot>
      <TooltipProvider>
        <TooltipRoot>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <button ref={ref} type="button" className={styles.iconWrapper}>
                <CircleHelp className={styles.icon} />
              </button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent sideOffset={4}>Help</TooltipContent>
        </TooltipRoot>
      </TooltipProvider>

      <DropdownMenuPortal>
        <DropdownMenuContent
          align="end"
          sideOffset={4}
          className={styles.menuContent}
        >
          <DropdownMenuItem
            size="sm"
            leftIcon={<BookText />}
            // TODO: Update the URL
            onSelect={handleSelect('https://liam-docs-sigma.vercel.app/docs')}
          >
            Documentation
          </DropdownMenuItem>
          <DropdownMenuItem
            size="sm"
            leftIcon={<MessagesSquare />}
            onSelect={handleSelect(
              'https://github.com/liam-hq/liam/discussions',
            )}
          >
            Community Forum
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenuRoot>
  )
})

HelpButton.displayName = 'HelpButton'
