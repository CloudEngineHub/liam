import { Copy, SidebarMenuButton, SidebarMenuItem, useCopy } from '@liam-hq/ui'
import { type FC, useCallback } from 'react'
import { clickLogEvent } from '@/features/gtm/utils'
import { useVersionOrThrow } from '@/providers'
import styles from './CopyLinkButton.module.css'

export const CopyLinkButton: FC = () => {
  const { version } = useVersionOrThrow()
  const { copy } = useCopy({
    toast: {
      success: 'Link copied!',
      error: 'URL copy failed',
    },
  })

  const handleCopyUrl = useCallback(() => {
    copy(window.location.href)

    clickLogEvent({
      element: 'copyLinkButton',
      platform: version.displayedOn,
      ver: version.version,
      gitHash: version.gitHash,
      appEnv: version.envName,
    })
  }, [copy, version])

  return (
    <SidebarMenuItem>
      <SidebarMenuButton className={styles.button} onClick={handleCopyUrl}>
        <Copy className={styles.icon} />
        <span className={styles.label}>Copy Link</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
