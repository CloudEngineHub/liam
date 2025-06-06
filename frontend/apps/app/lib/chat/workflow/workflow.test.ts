import type { Schema } from '@liam-hq/db-structure'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { executeChatWorkflow } from './index'
import type { WorkflowState } from './types'

// Mock the LangChain module
vi.mock('@/lib/langchain', () => ({
  getAgent: vi.fn(),
  createPromptVariables: vi.fn(
    (schemaText: string, userMessage: string, history: [string, string][]) => ({
      schema_text: schemaText,
      user_message: userMessage,
      chat_history:
        history
          .map(([role, content]: [string, string]) => `${role}: ${content}`)
          .join('\n') || 'No previous conversation.',
    }),
  ),
}))

// Mock the schema converter
vi.mock('@/app/lib/schema/convertSchemaToText', () => ({
  convertSchemaToText: vi.fn(() => 'Mocked schema text'),
}))

describe('Chat Workflow', () => {
  let mockSchemaData: Schema
  let mockAgent: {
    generate: ReturnType<typeof vi.fn>
    stream: ReturnType<typeof vi.fn>
  }
  let mockGetAgent: ReturnType<typeof vi.fn>

  // Helper function to create test schema data
  const createMockSchema = (): Schema => ({
    tables: {
      users: {
        name: 'users',
        columns: {
          id: {
            name: 'id',
            type: 'integer',
            default: null,
            check: null,
            primary: true,
            unique: false,
            notNull: true,
            comment: null,
          },
          email: {
            name: 'email',
            type: 'varchar',
            default: null,
            check: null,
            primary: false,
            unique: false,
            notNull: true,
            comment: null,
          },
          name: {
            name: 'name',
            type: 'varchar',
            default: null,
            check: null,
            primary: false,
            unique: false,
            notNull: false,
            comment: null,
          },
        },
        comment: null,
        indexes: {},
        constraints: {},
      },
    },
    relationships: {},
    tableGroups: {},
  })

  // Helper function to create base workflow state
  const createBaseState = (
    overrides: Partial<WorkflowState> = {},
  ): WorkflowState => ({
    mode: 'Ask',
    userInput: 'Test input',
    history: [],
    schemaData: mockSchemaData,
    projectId: 'test-project-id',
    buildingSchemaId: 'test-building-schema-id',
    ...overrides,
  })

  // Helper function to execute workflow and assert common expectations
  const executeAndAssertSuccess = async (
    state: WorkflowState,
    expectedMode: 'Ask' | 'Build',
  ) => {
    const result = await executeChatWorkflow(state, { streaming: false })

    expect(result.mode).toBe(expectedMode)
    expect(result.error).toBeUndefined()
    expect(result.finalResponse).toBe('Mocked agent response')
    expect(typeof result.finalResponse).toBe('string')
    expect(mockAgent.generate).toHaveBeenCalledOnce()

    return result
  }

  beforeEach(async () => {
    // Reset all mocks
    vi.clearAllMocks()

    // Get the mocked langchain module
    const langchainModule = await import('@/lib/langchain')
    mockGetAgent = vi.mocked(langchainModule.getAgent)

    // Create mock schema data
    mockSchemaData = createMockSchema()

    // Mock agent
    mockAgent = {
      generate: vi.fn().mockResolvedValue('Mocked agent response'),
      stream: vi.fn().mockReturnValue(
        (async function* () {
          yield 'Mocked agent response'
        })(),
      ),
    }

    // Setup langchain mock
    mockGetAgent.mockReturnValue(mockAgent)
  })

  describe('Ask Mode', () => {
    it('should execute successfully with valid Ask mode state', async () => {
      const state = createBaseState({
        mode: 'Ask',
        userInput: 'What is the users table structure?',
      })

      await executeAndAssertSuccess(state, 'Ask')
    })

    it('should handle Ask mode with history', async () => {
      const state = createBaseState({
        mode: 'Ask',
        userInput: 'What is the users table structure?',
        history: ['Previous message 1', 'Previous message 2'],
      })

      const result = await executeChatWorkflow(state, { streaming: false })

      expect(result.mode).toBe('Ask')
      expect(result.error).toBeUndefined()
      // History should be updated with new conversation
      expect(result.history).toHaveLength(4) // 2 original + 2 new (user + assistant)
      expect(result.history).toContain(
        'User: What is the users table structure?',
      )
      expect(result.history).toContain('Assistant: Mocked agent response')
    })
  })

  describe('Build Mode', () => {
    it('should execute successfully with valid Build mode state', async () => {
      const state = createBaseState({
        mode: 'Build',
        userInput: 'Add a created_at timestamp column to the users table',
      })

      await executeAndAssertSuccess(state, 'Build')
    })

    it('should handle Build mode with complex schema modifications', async () => {
      const state = createBaseState({
        mode: 'Build',
        userInput: 'Create a new posts table with foreign key to users',
      })

      await executeAndAssertSuccess(state, 'Build')
    })
  })

  describe('Error Handling', () => {
    it('should handle missing mode gracefully', async () => {
      const testState = createBaseState({
        userInput: 'What is the users table structure?',
      })
      // Remove mode property by creating a new object without it
      const { mode, ...stateWithoutMode } = testState
      const invalidState = stateWithoutMode as WorkflowState

      const result = await executeChatWorkflow(invalidState, {
        streaming: false,
      })

      expect(result).toBeDefined()
      expect(result.error).toBe('Mode must be selected in UI before processing')
    })

    it('should handle missing schema data gracefully', async () => {
      const testState = createBaseState({
        mode: 'Ask',
        userInput: 'What is the database structure?',
      })
      // Remove schemaData property by creating a new object without it
      const { schemaData, ...stateWithoutSchema } = testState
      const invalidState = stateWithoutSchema as WorkflowState

      const result = await executeChatWorkflow(invalidState, {
        streaming: false,
      })

      expect(result).toBeDefined()
      expect(result.error).toBe('Schema data is required for answer generation')
    })

    it('should handle agent generation errors', async () => {
      mockAgent.generate.mockRejectedValue(new Error('Agent generation failed'))
      const state = createBaseState()

      const result = await executeChatWorkflow(state, { streaming: false })

      expect(result.error).toBe('Agent generation failed')
      expect(result.finalResponse).toBe(
        'Sorry, an error occurred during processing: Agent generation failed',
      )
    })

    it('should handle missing agent', async () => {
      mockGetAgent.mockImplementation(() => {
        throw new Error(
          'databaseSchemaAskAgent not found in LangChain instance',
        )
      })
      const state = createBaseState()

      const result = await executeChatWorkflow(state, { streaming: false })

      expect(result.error).toBe(
        'databaseSchemaAskAgent not found in LangChain instance',
      )
      expect(result.finalResponse).toBe(
        'Sorry, an error occurred during processing: databaseSchemaAskAgent not found in LangChain instance',
      )
    })

    it('should handle empty user input', async () => {
      const state = createBaseState({ userInput: '' })

      const result = await executeChatWorkflow(state, { streaming: false })

      expect(result).toBeDefined()
      expect(result.userInput).toBe('')
      expect(result.finalResponse).toBe('Mocked agent response')
    })
  })

  describe('State Management', () => {
    it('should preserve state properties through workflow execution', async () => {
      const initialState = createBaseState({
        userInput: 'Test state management',
        history: ['Previous message 1', 'Previous message 2'],
        projectId: 'test-project-123',
      })

      const result = await executeChatWorkflow(initialState, {
        streaming: false,
      })

      expect(result.userInput).toBe(initialState.userInput)
      expect(result.projectId).toBe(initialState.projectId)
      expect(result.schemaData).toEqual(initialState.schemaData)
      expect(result.history).toHaveLength(4) // 2 original + 2 new
    })
  })

  describe('Agent Selection', () => {
    const agentTestCases = [
      { mode: 'Ask' as const, expectedAgent: 'databaseSchemaAskAgent' },
      { mode: 'Build' as const, expectedAgent: 'databaseSchemaBuildAgent' },
    ]

    for (const { mode, expectedAgent } of agentTestCases) {
      it(`should use ${expectedAgent} for ${mode} mode`, async () => {
        const state = createBaseState({ mode })

        await executeChatWorkflow(state, { streaming: false })

        expect(mockGetAgent).toHaveBeenCalledWith(expectedAgent)
      })
    }
  })

  describe('Workflow Integration', () => {
    // Helper function to execute multiple workflows sequentially
    const executeSequentialWorkflows = async (
      states: Partial<WorkflowState>[],
    ) => {
      const results = []
      for (const stateOverride of states) {
        // Reset mocks for each execution
        mockAgent.stream.mockReturnValue(
          (async function* () {
            yield 'Mocked agent response'
          })(),
        )
        const state = createBaseState(stateOverride)
        const result = await executeChatWorkflow(state, { streaming: false })
        results.push(result)
      }
      return results
    }

    it('should handle multiple sequential workflow executions', async () => {
      const stateOverrides = [
        { mode: 'Ask' as const, userInput: 'First question' },
        { mode: 'Build' as const, userInput: 'First modification' },
        { mode: 'Ask' as const, userInput: 'Follow-up question' },
      ]

      const results = await executeSequentialWorkflows(stateOverrides)

      expect(results).toHaveLength(3)
      for (const [index, result] of results.entries()) {
        expect(result).toBeDefined()
        expect(result.mode).toBe(stateOverrides[index].mode)
        expect(result.userInput).toBe(stateOverrides[index].userInput)
        expect(result.finalResponse).toBe('Mocked agent response')
      }
    })

    it('should maintain consistency across different input types', async () => {
      const testInputs = [
        'Simple question about users table',
        'Complex query with multiple joins and conditions',
        'Schema modification request with constraints',
        'Question with special characters: @#$%^&*()',
        'Multi-line\ninput\nwith\nbreaks',
      ]

      const stateOverrides = testInputs.map((userInput) => ({ userInput }))
      const results = await executeSequentialWorkflows(stateOverrides)

      for (const [index, result] of results.entries()) {
        expect(result).toBeDefined()
        expect(result.userInput).toBe(testInputs[index])
        expect(result.finalResponse).toBe('Mocked agent response')
      }
    })
  })
})
