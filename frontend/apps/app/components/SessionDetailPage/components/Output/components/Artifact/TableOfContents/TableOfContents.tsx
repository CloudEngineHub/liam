'use client'

import clsx from 'clsx'
import { type FC, useEffect, useState } from 'react'
import { generateHeadingId } from '../utils/generateHeadingId'
import styles from './TableOfContents.module.css'

type TocItem = {
  id: string
  text: string
  level: number
}

type Props = {
  content: string
}

const parseHeading = (
  line: string,
  slugCountMap: Map<string, number>,
): TocItem | null => {
  const headingMatch = line.match(/^(#{1,5})\s+(.+)$/)
  if (!headingMatch) return null

  const levelMatch = headingMatch[1]
  const text = headingMatch[2]
  if (!levelMatch || !text) return null

  const level = levelMatch.length
  const baseSlug = generateHeadingId(text)

  // Handle duplicate slugs
  const count = slugCountMap.get(baseSlug) ?? 0
  slugCountMap.set(baseSlug, count + 1)

  const id = count === 0 ? baseSlug : `${baseSlug}-${count + 1}`

  return { id, text, level }
}

const extractTocItems = (content: string): TocItem[] => {
  const items: TocItem[] = []
  const lines = content.split('\n')
  const slugCountMap = new Map<string, number>()

  for (const line of lines) {
    const heading = parseHeading(line, slugCountMap)
    if (heading) {
      items.push(heading)
    }
  }

  return items
}

export const TableOfContents: FC<Props> = ({ content }) => {
  const [toc, setToc] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const items = extractTocItems(content)
    setToc(items)
  }, [content])

  useEffect(() => {
    const handleScroll = () => {
      // Search for headings within Artifact content
      const contentWrapper = document.querySelector('[data-artifact-content]')
      if (!contentWrapper) {
        return
      }

      const elements = contentWrapper.querySelectorAll(
        'h1[id], h2[id], h3[id], h4[id], h5[id]',
      )
      const scrollPosition = window.scrollY + 100

      for (let i = elements.length - 1; i >= 0; i--) {
        const element = elements[i]
        if (
          element &&
          element.getBoundingClientRect().top + window.scrollY <= scrollPosition
        ) {
          setActiveId(element.id || '')
          break
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleClick = (id: string) => {
    setActiveId(id) // Set activeId immediately on click
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  if (toc.length === 0) {
    return null
  }

  return (
    <nav className={styles.toc}>
      <h3 className={styles.title}>Table of Contents</h3>
      <ul className={styles.list}>
        {toc.map((item) => (
          <li
            key={`toc-${item.id}`}
            className={clsx(
              styles.item,
              item.level === 1 && styles.level1,
              item.level === 2 && styles.level2,
              item.level === 3 && styles.level3,
              item.level === 4 && styles.level4,
              item.level === 5 && styles.level5,
            )}
          >
            <button
              type="button"
              onClick={() => handleClick(item.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleClick(item.id)
                }
              }}
              className={clsx(
                styles.link,
                activeId === item.id && styles.active,
              )}
              tabIndex={0}
              aria-label={`Navigate to ${item.text}`}
              aria-current={activeId === item.id ? 'location' : undefined}
            >
              {item.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
