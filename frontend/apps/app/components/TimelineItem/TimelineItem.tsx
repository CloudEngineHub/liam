'use client'

import { AgentMessage } from '@/components/Chat/AgentMessage'
import { MarkdownContent } from '@/components/MarkdownContent'
import { UserMessage } from '@/components/Chat/UserMessage'
import { VersionMessage } from '@/components/Chat/VersionMessage'
import type { Database } from '@liam-hq/db'
import type { FC, ReactNode } from 'react'
import styles from './TimelineItem.module.css'

// TODO: Modify to use what is inferred from the valibot schema
export type TimelineItemProps =
  | {
      content: string
      role: Database['public']['Enums']['timeline_item_type_enum']
      timestamp?: Date
      avatarSrc?: string
      avatarAlt?: string
      initial?: string
      /**
       * Whether the bot is generating a response
       * @default false
       */
      isGenerating?: boolean
      /**
       * Optional children to render below the message content
       */
      children?: ReactNode
      /**
       * Progress messages to display above the main message
       */
      progressMessages?: string[]
      /**
       * Whether to show progress messages
       */
      showProgress?: boolean
    }
  | {
      id: string
      role: 'schema_version'
      content: string
      building_schema_version_id: string
    }

export const TimelineItem: FC<TimelineItemProps> = (props) => {
  // Handle schema_version role separately
  if ('building_schema_version_id' in props) {
    return (
      <div className={styles.messageContainer}>
        <VersionMessage
          buildingSchemaVersionId={props.building_schema_version_id}
        />
      </div>
    )
  }

  // Destructure props for regular messages
  const {
    content,
    role,
    timestamp,
    avatarSrc,
    avatarAlt,
    initial,
    isGenerating = false,
    children,
    progressMessages,
    showProgress,
  } = props

  // Only format and display timestamp if it exists
  const formattedTime = timestamp
    ? timestamp.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null

  // For bot messages, we'll render the markdown content with syntax highlighting
  const markdownContent =
    role !== 'user' ? <MarkdownContent content={content} /> : null

  return (
    <div className={styles.messageContainer}>
      {role === 'user' ? (
        <UserMessage
          content={content}
          timestamp={timestamp}
          avatarSrc={avatarSrc}
          avatarAlt={avatarAlt}
          initial={initial}
        />
      ) : (
        <AgentMessage
          state={isGenerating ? 'generating' : 'default'}
          message={markdownContent}
          time={formattedTime || ''}
          progressMessages={progressMessages}
          showProgress={showProgress}
        >
          {children}
        </AgentMessage>
      )}
    </div>
  )
}
