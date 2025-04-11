import { createClient } from '../libs/supabase'
import type { ReviewResponse } from '../types'

export const processSaveReview = async (
  payload: ReviewResponse,
): Promise<{ success: boolean; overallReviewId: number }> => {
  try {
    const supabase = createClient()
    const { data: pullRequest, error: pullRequestError } = await supabase
      .from('PullRequest')
      .select('*')
      .eq('id', payload.pullRequestId)
      .single()

    if (pullRequestError || !pullRequest) {
      throw new Error(
        `PullRequest not found: ${JSON.stringify(pullRequestError)}`,
      )
    }

    const now = new Date().toISOString()

    // create overall review
    const { data: overallReview, error: overallReviewError } = await supabase
      .from('OverallReview')
      .insert({
        projectId: payload.projectId,
        pullRequestId: pullRequest.id,
        reviewComment: payload.review.bodyMarkdown.content,
        branchName: payload.branchName,
        traceId: payload.traceId,
        updatedAt: now,
      })
      .select()
      .single()

    if (overallReviewError || !overallReview) {
      throw new Error(
        `Failed to create overall review: ${JSON.stringify(overallReviewError)}`,
      )
    }

    // Create review issues directly from the feedback data

    // Create review issues
    const reviewIssues = payload.review.feedbacks.map((feedback) => ({
      overallReviewId: overallReview.id,
      category: mapCategoryEnum(feedback.kind),
      severity: feedback.severity,
      description: feedback.description,
      suggestion: feedback.suggestion.content,
      updatedAt: now,
    }))

    const { data: insertedIssues, error: reviewIssuesError } = await supabase
      .from('ReviewIssue')
      .insert(reviewIssues)
      .select('id')

    if (reviewIssuesError || !insertedIssues) {
      throw new Error(
        `Failed to create review issues: ${JSON.stringify(reviewIssuesError)}`,
      )
    }

    // create suggestion snippet
    const suggestionSnippet = payload.review.feedbacks
      .map((feedback, index) => {
        const reviewIssue = insertedIssues[index]
        return reviewIssue
          ? {
              feedback,
              reviewIssueId: reviewIssue.id,
            }
          : null
      })
      .filter(
        (
          item,
        ): item is {
          feedback: (typeof payload.review.feedbacks)[0]
          reviewIssueId: number
        } => item !== null && item.feedback.severity !== 'POSITIVE',
      )
      .flatMap(({ feedback, reviewIssueId }) =>
        feedback.suggestionSnippets.map((snippet) => ({
          ...snippet,
          reviewIssueId,
          updatedAt: now,
        })),
      ) as Array<{
      filename: string
      snippet: string
      reviewIssueId: number
      updatedAt: string
    }>

    const { data: insertedSuggestionSnippets, error: suggestionSnippetError } =
      await supabase
        .from('ReviewSuggestionSnippet')
        .insert(suggestionSnippet)
        .select('id')

    if (suggestionSnippetError || !insertedSuggestionSnippets) {
      throw new Error(
        `Failed to create suggestion snippet: ${JSON.stringify(suggestionSnippetError)}`,
      )
    }

    return {
      success: true,
      overallReviewId: overallReview.id,
    }
  } catch (error) {
    console.error('Error saving review:', error)
    throw error
  }
}

// Helper function to map category from review schema to CategoryEnum
const mapCategoryEnum = (
  category: string,
):
  | 'MIGRATION_SAFETY'
  | 'DATA_INTEGRITY'
  | 'PERFORMANCE_IMPACT'
  | 'PROJECT_RULES_CONSISTENCY'
  | 'SECURITY_OR_SCALABILITY' => {
  const mapping: Record<
    string,
    | 'MIGRATION_SAFETY'
    | 'DATA_INTEGRITY'
    | 'PERFORMANCE_IMPACT'
    | 'PROJECT_RULES_CONSISTENCY'
    | 'SECURITY_OR_SCALABILITY'
  > = {
    'Migration Safety': 'MIGRATION_SAFETY',
    'Data Integrity': 'DATA_INTEGRITY',
    'Performance Impact': 'PERFORMANCE_IMPACT',
    'Project Rules Consistency': 'PROJECT_RULES_CONSISTENCY',
    'Security or Scalability': 'SECURITY_OR_SCALABILITY',
    // Add fallback for unknown category
    Unknown: 'MIGRATION_SAFETY', // Default to MIGRATION_SAFETY for unknown categories
  }
  const result = mapping[category]
  if (!result) {
    console.warn(
      `Unknown category: ${category}, defaulting to MIGRATION_SAFETY`,
    )
    return 'MIGRATION_SAFETY'
  }
  return result
}
