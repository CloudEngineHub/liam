import type React from 'react'
import { type ComponentProps, type ReactNode, forwardRef } from 'react'
import {
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
} from '../Tooltip'
import styles from './IconButton.module.css'

type Props = {
  icon: ReactNode
  tooltipSide?: ComponentProps<typeof TooltipContent>['side']
  tooltipContent: string
  onClick?: React.MouseEventHandler<HTMLButtonElement>
}

export const IconButton = forwardRef<HTMLButtonElement, Props>(
  ({ icon, tooltipSide = 'bottom', tooltipContent, ...props }, ref) => {
    return (
      <TooltipProvider>
        <TooltipRoot>
          <TooltipTrigger asChild>
            <button
              ref={ref}
              type="button"
              className={styles.iconWrapper}
              {...props}
            >
              <span className={styles.icon}>{icon}</span>
            </button>
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent side={tooltipSide} sideOffset={4}>
              {tooltipContent}
            </TooltipContent>
          </TooltipPortal>
        </TooltipRoot>
      </TooltipProvider>
    )
  },
)

IconButton.displayName = 'IconButton'
