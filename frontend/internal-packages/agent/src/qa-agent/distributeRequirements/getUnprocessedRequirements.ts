import { err, ok, type Result } from 'neverthrow'
import { WorkflowTerminationError } from '../../utils/errorHandling'
import type { QaAgentState } from '../shared/qaAgentAnnotation'
import type { TestCaseData } from './types'

/**
 * Prepare all testcases that need SQL generation
 */
function prepareTestcases(
  state: QaAgentState,
): Result<TestCaseData[], WorkflowTerminationError> {
  const { analyzedRequirements } = state
  const allTestcases: TestCaseData[] = []
  const goal = analyzedRequirements.goal || ''

  // Process all testcases
  for (const [category, testcases] of Object.entries(
    analyzedRequirements.testcases,
  )) {
    for (const testcase of testcases) {
      // Only include testcases that don't have SQL yet
      if (!testcase.sql || testcase.sql === '') {
        allTestcases.push({
          category,
          testcase: {
            title: testcase.title,
            type: testcase.type,
          },
          goal,
        })
      }
    }
  }

  // If no testcases found, return error
  if (allTestcases.length === 0) {
    return err(
      new WorkflowTerminationError(
        new Error('No testcases to process after distribution.'),
        'continueToRequirements',
      ),
    )
  }

  return ok(allTestcases)
}

/**
 * Get unprocessed testcases (those without SQL)
 */
export function getUnprocessedRequirements(
  state: QaAgentState,
): TestCaseData[] {
  const testcasesResult = prepareTestcases(state)

  if (testcasesResult.isErr()) {
    // If prepareTestcases fails (no testcases), return empty array
    return []
  }

  return testcasesResult.value
}
