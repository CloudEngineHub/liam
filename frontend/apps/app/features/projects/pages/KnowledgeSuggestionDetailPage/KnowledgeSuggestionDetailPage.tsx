import { createClient } from '@/libs/db/server'
import { urlgen } from '@/utils/routes'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { FC } from 'react'
import { approveKnowledgeSuggestion } from '../../actions/approveKnowledgeSuggestion'
import styles from './KnowledgeSuggestionDetailPage.module.css'

type Props = {
  projectId: string
  suggestionId: string
}

async function getKnowledgeSuggestionDetail(
  projectId: string,
  suggestionId: string,
) {
  try {
    const projectId_num = Number(projectId)
    const suggestionId_num = Number(suggestionId)
    const supabase = await createClient()

    // Get the knowledge suggestion with project info
    const { data: suggestion, error } = await supabase
      .from('KnowledgeSuggestion')
      .select(`
        *,
        project:Project(
          id,
          name,
          repositoryMappings:ProjectRepositoryMapping(
            repository:Repository(*)
          )
        )
      `)
      .eq('id', suggestionId_num)
      .eq('projectId', projectId_num)
      .single()

    if (error || !suggestion) {
      console.error('Error fetching knowledge suggestion:', error)
      notFound()
    }

    return suggestion
  } catch (error) {
    console.error('Error fetching knowledge suggestion detail:', error)
    notFound()
  }
}

export const KnowledgeSuggestionDetailPage: FC<Props> = async ({
  projectId,
  suggestionId,
}) => {
  const suggestion = await getKnowledgeSuggestionDetail(projectId, suggestionId)
  const repository = suggestion.project.repositoryMappings[0]?.repository

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <Link
            href={urlgen(
              'projects/[projectId]/ref/[branchOrCommit]/knowledge-suggestions',
              {
                projectId,
                branchOrCommit: suggestion.branchName,
              },
            )}
            className={styles.backLink}
            aria-label="Back to knowledge suggestions list"
          >
            ← Back to Knowledge Suggestions
          </Link>
          <h1 className={styles.title}>{suggestion.title}</h1>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.metaSection}>
          <span className={styles.metaItem}>Type: {suggestion.type}</span>
          <span className={styles.metaItem}>Path: {suggestion.path}</span>
          <span
            className={suggestion.approvedAt ? styles.approved : styles.pending}
          >
            Status: {suggestion.approvedAt ? 'Approved' : 'Pending'}
          </span>
          <span className={styles.metaItem}>
            Created:{' '}
            {new Date(suggestion.createdAt).toLocaleDateString('en-US')}
          </span>
          {suggestion.approvedAt && (
            <span className={styles.metaItem}>
              Approved:{' '}
              {new Date(suggestion.approvedAt).toLocaleDateString('en-US')}
            </span>
          )}
        </div>

        <div className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Content</h2>
          <pre className={styles.codeContent}>{suggestion.content}</pre>
        </div>

        {!suggestion.approvedAt && repository && (
          <div className={styles.actionSection}>
            <form action={approveKnowledgeSuggestion}>
              <input type="hidden" name="suggestionId" value={suggestion.id} />
              <input
                type="hidden"
                name="repositoryOwner"
                value={repository.owner}
              />
              <input
                type="hidden"
                name="repositoryName"
                value={repository.name}
              />
              <input
                type="hidden"
                name="installationId"
                value={repository.installationId.toString()}
              />
              <button type="submit" className={styles.approveButton}>
                Approve
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
