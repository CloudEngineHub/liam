import type { Text } from '@codemirror/state'
import { StateEffect, StateField } from '@codemirror/state'
import {
  Decoration,
  type DecorationSet,
  EditorView,
  WidgetType,
} from '@codemirror/view'
import { createRoot } from 'react-dom/client'
import type { ReviewComment } from '../../../../../../types'
import { Comment } from './Comment'

// Widget that displays comments as DOM elements
class CommentWidget extends WidgetType {
  readonly comment: ReviewComment
  readonly onQuickFix: (comment: string) => void

  constructor(comment: ReviewComment, onQuickFix: (comment: string) => void) {
    super()
    this.comment = comment
    this.onQuickFix = onQuickFix
  }

  toDOM() {
    const container = document.createElement('div')
    const root = createRoot(container)
    root.render(
      <Comment
        comment={this.comment.message}
        level={this.comment.severity}
        onQuickFix={this.onQuickFix}
      />,
    )

    return container
  }

  override ignoreEvent() {
    return false
  }
}

// Helper function to create line decorations for a comment
const createLineDecorations = (comment: ReviewComment, doc: Text) => {
  const decorations = []
  for (let i = comment.fromLine; i <= comment.toLine; i++) {
    if (i > doc.lines) continue
    const line = doc.line(i)
    decorations.push(
      Decoration.line({
        attributes: {
          class: `cm-highlighted-line severity-bg-${comment.severity.toLowerCase()}`,
        },
      }).range(line.from),
    )
  }
  return decorations
}

// Helper function to create widget decoration for a comment
const createWidgetDecoration = (
  comment: ReviewComment,
  doc: Text,
  onQuickFix: (comment: string) => void,
) => {
  const widgetLine = doc.line(comment.toLine)
  return Decoration.widget({
    widget: new CommentWidget(comment, onQuickFix),
    side: 1,
  }).range(widgetLine.to)
}

// Helper function to create all decorations for a comment
const createCommentDecorations = (
  comment: ReviewComment,
  doc: Text,
  onQuickFix: (comment: string) => void,
) => {
  if (comment.toLine > doc.lines) {
    return []
  }

  const lineDecorations = createLineDecorations(comment, doc)
  const widgetDecoration = createWidgetDecoration(comment, doc, onQuickFix)

  return [...lineDecorations, widgetDecoration]
}

export const setCommentsEffect = StateEffect.define<ReviewComment[]>()

export const commentStateField = (onQuickFix: (comment: string) => void) => {
  return StateField.define<DecorationSet>({
    create() {
      return Decoration.none
    },
    update(decorations, tr) {
      for (const effect of tr.effects) {
        if (effect.is(setCommentsEffect)) {
          const comments = effect.value
          if (comments.length === 0) {
            return Decoration.none
          }

          const newDecorations = comments.flatMap((comment) =>
            createCommentDecorations(comment, tr.state.doc, onQuickFix),
          )

          return Decoration.set(newDecorations, true)
        }
      }

      if (tr.docChanged) {
        return decorations.map(tr.changes)
      }

      return decorations
    },
    provide(field) {
      return EditorView.decorations.from(field)
    },
  })
}
