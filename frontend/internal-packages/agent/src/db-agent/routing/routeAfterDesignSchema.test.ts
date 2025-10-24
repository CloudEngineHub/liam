import { AIMessage, HumanMessage } from '@langchain/core/messages'
import { END } from '@langchain/langgraph'
import { describe, expect, it } from 'vitest'
import { WorkflowTerminationError } from '../../utils/errorHandling'
import type { DbAgentState } from '../shared/dbAgentAnnotation'
import { routeAfterDesignSchema } from './routeAfterDesignSchema'

const createDbAgentState = (
  messages: DbAgentState['messages'],
  designSchemaRetryCount = 0,
): DbAgentState => ({
  messages,
  schemaData: { tables: {}, enums: {}, extensions: {} },
  organizationId: 'test-org',
  userId: 'test-user',
  designSessionId: 'test-session',
  prompt: 'test input',
  next: END,
  designSchemaRetryCount,
  schemaDesignSuccessful: false,
})

describe('routeAfterDesignSchema', () => {
  it('should return invokeSchemaDesignTool when message has tool calls', () => {
    const messageWithToolCalls = new AIMessage({
      content: 'I need to update the schema',
      tool_calls: [
        {
          name: 'schemaDesignTool',
          args: { operations: [] },
          id: 'test-id',
        },
      ],
    })

    const state = createDbAgentState([messageWithToolCalls])
    const result = routeAfterDesignSchema(state)

    expect(result).toBe('invokeSchemaDesignTool')
  })

  it('should return END when message has no tool calls and retry count is below limit (design complete)', () => {
    const messageWithoutToolCalls = new AIMessage({
      content: 'Schema design is complete',
    })

    const state = createDbAgentState([messageWithoutToolCalls], 1)
    const result = routeAfterDesignSchema(state)

    expect(result).toBe(END)
  })

  it('should return END when message has empty tool calls array (design complete)', () => {
    const messageWithEmptyToolCalls = new AIMessage({
      content: 'Schema design is complete, no tools needed',
      tool_calls: [],
    })

    const state = createDbAgentState([messageWithEmptyToolCalls], 0)
    const result = routeAfterDesignSchema(state)

    expect(result).toBe(END)
  })

  it('should return END for HumanMessage (no tool calls)', () => {
    const humanMessage = new HumanMessage({
      content: 'User input',
    })

    const state = createDbAgentState([humanMessage], 0)
    const result = routeAfterDesignSchema(state)

    expect(result).toBe(END)
  })

  it('should throw error when retry count reaches maximum without tool calls', () => {
    const messageWithoutToolCalls = new AIMessage({
      content: 'Schema analysis complete',
    })

    const state = createDbAgentState([messageWithoutToolCalls], 3)

    expect(() => routeAfterDesignSchema(state)).toThrow(
      WorkflowTerminationError,
    )
    expect(() => routeAfterDesignSchema(state)).toThrow(
      'Failed to design schema with tool usage after 3 attempts',
    )
  })

  it('should return invokeSchemaDesignTool on successful 3rd attempt with tool calls', () => {
    const messageWithToolCalls = new AIMessage({
      content: 'I need to update the schema',
      tool_calls: [
        {
          name: 'schemaDesignTool',
          args: { operations: [] },
          id: 'test-id',
        },
      ],
    })

    // Even with retry count at 3, if we have tool calls, we should proceed
    const state = createDbAgentState([messageWithToolCalls], 3)
    const result = routeAfterDesignSchema(state)

    expect(result).toBe('invokeSchemaDesignTool')
  })

  it('should handle multiple messages and check only the last one (return END when last has no tools)', () => {
    const messageWithToolCalls = new AIMessage({
      content: 'I need to update the schema',
      tool_calls: [
        {
          name: 'schemaDesignTool',
          args: { operations: [] },
          id: 'test-id',
        },
      ],
    })

    const messageWithoutToolCalls = new AIMessage({
      content: 'Schema design is complete',
    })

    const state = createDbAgentState(
      [messageWithToolCalls, messageWithoutToolCalls],
      0,
    )
    const result = routeAfterDesignSchema(state)

    expect(result).toBe(END)
  })

  it('should handle multiple tool calls', () => {
    const messageWithMultipleToolCalls = new AIMessage({
      content: 'I need to update the schema',
      tool_calls: [
        {
          name: 'schemaDesignTool',
          args: { operations: [] },
          id: 'test-id-1',
        },
        {
          name: 'schemaDesignTool',
          args: { operations: [] },
          id: 'test-id-2',
        },
      ],
    })

    const state = createDbAgentState([messageWithMultipleToolCalls])
    const result = routeAfterDesignSchema(state)

    expect(result).toBe('invokeSchemaDesignTool')
  })
})
